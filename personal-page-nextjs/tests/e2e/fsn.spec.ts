import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { findNode, fsTree } from '../../app/content/fsTree'
import { computeLayout, layoutModeFor } from '../../app/components/FsnScene/fsnLayout'
import { BEAM_HEIGHT, beamAxisOffsetAt, beamRadiusAt } from '../../app/components/FsnScene/spotlightGeometry'
import { iconKindFor } from '../../app/components/FsnScene/fileIcons'
import type { FsNode } from '../../app/content/fsTree'

type Point = { x: number; y: number }

async function waitForScene(page: Page) {
  await page.goto('/')
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30_000 })
  await page.waitForFunction(
    () => Boolean(window.__fsn && window.__fsn.screenPosition && window.__fsn.screenPosition('/')),
    undefined,
    { timeout: 30_000 },
  )
}

async function readPosition(page: Page, path: string): Promise<Point | null> {
  return page.evaluate((target) => window.__fsn?.screenPosition?.(target) ?? null, path)
}

// The camera damps toward its target: poll until three reads 300ms apart agree, so a brief
// pause at the start of a camera move is not mistaken for having settled.
async function settledPosition(page: Page, path: string): Promise<Point> {
  let previous = await readPosition(page, path)
  let stableReads = 0
  for (let attempt = 0; attempt < 80; attempt++) {
    await page.waitForTimeout(300)
    const current = await readPosition(page, path)
    const unchanged =
      previous !== null &&
      current !== null &&
      Math.abs(previous.x - current.x) < 0.5 &&
      Math.abs(previous.y - current.y) < 0.5
    stableReads = unchanged ? stableReads + 1 : 0
    if (unchanged && stableReads >= 3) return current!
    previous = current
  }
  throw new Error(`Camera never settled for ${path}`)
}

type Vector = [number, number, number]

async function readCamera(page: Page): Promise<Vector> {
  return page.evaluate(() => window.__fsn!.cameraPosition!())
}

// Poll until the camera has stopped moving for three reads in a row
async function settledCamera(page: Page): Promise<Vector> {
  let previous = await readCamera(page)
  let stableReads = 0
  for (let attempt = 0; attempt < 80; attempt++) {
    await page.waitForTimeout(300)
    const current = await readCamera(page)
    const unchanged = current.every((value, index) => Math.abs(value - previous[index]) < 0.01)
    stableReads = unchanged ? stableReads + 1 : 0
    if (stableReads >= 3) return current
    previous = current
  }
  throw new Error('Camera never settled')
}

async function getState(page: Page) {
  return page.evaluate(() => window.__fsn!.getState())
}

async function isTouch(page: Page) {
  return page.evaluate(() => matchMedia('(pointer: coarse)').matches)
}

// One gesture that selects only: a click (desktop) or a tap (touch)
async function clickOnce(page: Page, path: string) {
  const point = await revealIfHidden(page, path)
  if (await isTouch(page)) await page.touchscreen.tap(point.x, point.y)
  else await page.mouse.click(point.x, point.y)
}

// The start view crops the outermost pedestals (and the terminal panel covers the right edge),
// so a node can be off screen or under the panel. A user would press the bird's-eye button.
async function revealIfHidden(page: Page, path: string): Promise<Point> {
  let point = await settledPosition(page, path)
  const reachable = () =>
    page.evaluate(
      (spot) =>
        spot.x >= 0 &&
        spot.y >= 0 &&
        spot.x <= innerWidth &&
        spot.y <= innerHeight &&
        document.elementFromPoint(spot.x, spot.y)?.tagName === 'CANVAS',
      point,
    )
  if (!(await reachable())) {
    const button = page.getByTestId('fsn-birdseye')
    if ((await button.getAttribute('aria-pressed')) !== 'true') await button.click()
    point = await settledPosition(page, path)
  }
  return point
}

// fsnav gestures: double-click activates a node on desktop; on touch the second tap on the
// already-selected node activates it.
// Desktop: double-click. Touch: one tap flies to a directory; a file needs a second tap once the
// camera has zoomed in on it (the first tap moves it on screen, as it would for a real visitor).
async function activate(page: Page, path: string) {
  const point = await revealIfHidden(page, path)
  if (await isTouch(page)) {
    await page.touchscreen.tap(point.x, point.y)
    await expect.poll(async () => (await getState(page)).selectedPath).toBe(path)
    if ((await getState(page)).currentPath === path) return
    const zoomed = await settledPosition(page, path)
    await page.touchscreen.tap(zoomed.x, zoomed.y)
  } else {
    await page.mouse.dblclick(point.x, point.y)
  }
}

async function expectPath(page: Page, expected: string) {
  await expect.poll(async () => (await getState(page)).currentPath).toBe(expected)
}

async function openDir(page: Page, path: string) {
  await activate(page, path)
  try {
    await expect.poll(async () => (await getState(page)).currentPath, { timeout: 4_000 }).toBe(path)
  } catch {
    // A heavily loaded software-GL run can drop the first gesture; repeat it once
    await activate(page, path)
    await expectPath(page, path)
  }
}

test.describe('fsn navigator', () => {
  test.beforeEach(async ({ page }) => {
    await waitForScene(page)
  })

  test('canvas renders non-blank pixels', async ({ page }) => {
    await settledPosition(page, '/projects')
    const shot = await page.locator('canvas').first().screenshot()
    const distinctColors = await page.evaluate(async (base64) => {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
      const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }))
      const surface = document.createElement('canvas')
      surface.width = bitmap.width
      surface.height = bitmap.height
      const context = surface.getContext('2d')!
      context.drawImage(bitmap, 0, 0)
      const { data } = context.getImageData(0, 0, surface.width, surface.height)
      const seen = new Set<number>()
      for (let index = 0; index < data.length; index += 4 * 7) {
        // quantize so noise does not count as distinct
        seen.add(((data[index] >> 4) << 8) | ((data[index + 1] >> 4) << 4) | (data[index + 2] >> 4))
      }
      return seen.size
    }, shot.toString('base64'))
    expect(distinctColors).toBeGreaterThan(5)
  })

  test('a single click or tap flies into a pedestal', async ({ page }) => {
    await clickOnce(page, '/projects')
    await expectPath(page, '/projects')
    await expect(page.getByTestId('fsn-breadcrumb')).toContainText('projects')
  })

  test('a single click or tap on a file zooms in on it without opening it', async ({ page }) => {
    await openDir(page, '/skills')
    // screen distance between the file and its neighbour grows as the camera closes in
    const spread = () =>
      page.evaluate(() => {
        const file = window.__fsn!.screenPosition!('/skills/cloud.txt')
        const neighbour = window.__fsn!.screenPosition!('/skills/other.txt')
        return file && neighbour ? Math.hypot(file.x - neighbour.x, file.y - neighbour.y) : 0
      })
    await settledPosition(page, '/skills/cloud.txt')
    const spreadBefore = await spread()
    expect(spreadBefore).toBeGreaterThan(0)
    await clickOnce(page, '/skills/cloud.txt')
    await expect.poll(async () => (await getState(page)).selectedPath).toBe('/skills/cloud.txt')
    await expect.poll(spread).toBeGreaterThan(spreadBefore * 1.2)
    expect((await getState(page)).openFilePath).toBeNull()
  })

  test('the bird\'s-eye button flies up and back', async ({ page }) => {
    // the vertical gap between the root and a child changes when the camera flies up for the aerial view
    const gap = async () => {
      const root = await settledPosition(page, '/')
      const child = await settledPosition(page, '/projects')
      return Math.abs(root.y - child.y)
    }
    const before = await gap()
    const button = page.getByTestId('fsn-birdseye')
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    const above = await gap()
    expect(Math.abs(above - before)).toBeGreaterThan(10)
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(Math.abs((await gap()) - before)).toBeLessThan(3)
  })

  test('left-drag orbits the camera', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'mouse drag is a desktop gesture')
    const before = await settledPosition(page, '/projects')
    await page.mouse.move(120, 600)
    await page.mouse.down()
    await page.mouse.move(220, 600, { steps: 8 })
    await page.mouse.up()
    const after = await settledPosition(page, '/projects')
    expect(Math.abs(after.x - before.x) + Math.abs(after.y - before.y)).toBeGreaterThan(20)
    expect((await getState(page)).currentPath).toBe('/')
  })

  test('a drag that starts and ends over a pedestal orbits without selecting it', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'mouse drag is a desktop gesture')
    await page.evaluate(() => window.__fsn!.navigateTo('/skills'))
    await settledCamera(page)
    const before = await getState(page)
    const framed = await settledCamera(page)
    // the pedestal is big at this framing: press and release inside its on-screen footprint
    const pedestal = await settledPosition(page, '/skills')
    const startX = pedestal.x - 100
    await page.mouse.move(startX, pedestal.y)
    await page.mouse.down()
    await page.mouse.move(startX + 200, pedestal.y, { steps: 12 })
    await page.mouse.up()
    const orbited = await settledCamera(page)
    expect(Math.hypot(...orbited.map((value, index) => value - framed[index]))).toBeGreaterThan(2)
    const after = await getState(page)
    expect(after.selectedPath).toBe(before.selectedPath)
    expect(after.currentPath).toBe(before.currentPath)
  })

  test('clicking the current directory again after orbiting flies back to the framed view', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'mouse drag is a desktop gesture')
    await page.evaluate(() => window.__fsn!.navigateTo('/projects'))
    const framed = await settledCamera(page)
    await page.mouse.move(120, 600)
    await page.mouse.down()
    await page.mouse.move(260, 560, { steps: 8 })
    await page.mouse.up()
    const orbited = await settledCamera(page)
    expect(Math.hypot(...orbited.map((value, index) => value - framed[index]))).toBeGreaterThan(2)
    // the same call a click on the current directory makes
    await page.evaluate(() => window.__fsn!.navigateTo('/projects'))
    const recentred = await settledCamera(page)
    expect(Math.hypot(...recentred.map((value, index) => value - framed[index]))).toBeLessThan(0.5)
  })

  test('resizing the viewport eases the camera without the warp climb', async ({ page }) => {
    await page.evaluate(() => window.__fsn!.navigateTo('/projects'))
    await settledCamera(page)
    // sample the camera height every frame across the resize
    await page.evaluate(() => {
      const heights: number[] = []
      const sample = () => {
        heights.push(window.__fsn!.cameraPosition!()[1])
        ;(window as unknown as { __fsnHeights: number[]; __fsnFrame: number }).__fsnFrame = requestAnimationFrame(sample)
      }
      ;(window as unknown as { __fsnHeights: number[] }).__fsnHeights = heights
      sample()
    })
    const viewport = page.viewportSize()!
    await page.setViewportSize({ width: Math.round(viewport.width * 0.75), height: Math.round(viewport.height * 0.75) })
    await settledCamera(page)
    const heights = await page.evaluate(() => {
      const probe = window as unknown as { __fsnHeights: number[]; __fsnFrame: number }
      cancelAnimationFrame(probe.__fsnFrame)
      return probe.__fsnHeights
    })
    const start = heights[0]
    const end = heights[heights.length - 1]
    expect(Math.abs(end - start)).toBeGreaterThan(0.01) // the resize did re-frame
    expect(Math.max(...heights)).toBeLessThanOrEqual(Math.max(start, end) + 0.05)
  })

  test('navigating clears a stale hover', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'no hover on touch devices')
    await openDir(page, '/skills')
    const point = await settledPosition(page, '/skills/cloud.txt')
    await page.mouse.move(point.x - 20, point.y - 20)
    await page.mouse.move(point.x, point.y, { steps: 5 })
    await expect.poll(async () => (await getState(page)).hoveredPath).toBe('/skills/cloud.txt')
    await page.keyboard.press('Escape') // goes up a level; the pointer has not moved
    await expectPath(page, '/')
    await expect.poll(async () => (await getState(page)).hoveredPath).toBeNull()
  })

  test('double-clicking the projects pedestal navigates into it', async ({ page }) => {
    await openDir(page, '/projects')
    await expect(page.getByTestId('fsn-breadcrumb')).toContainText('projects')
    await expect(page.getByTestId('fsn-up')).toBeEnabled()
  })

  test('double-clicking a file block opens it in the terminal', async ({ page }) => {
    await openDir(page, '/projects')
    const filePath = '/projects/devops-pipelines'
    await activate(page, filePath)
    await expect.poll(async () => (await getState(page)).openFilePath).toBe(filePath)
    const terminalFile = page.getByTestId('terminal-file')
    await expect(terminalFile).toContainText(`cat ${filePath}`, { timeout: 10_000 })
    await expect(terminalFile).toContainText(findNode(filePath)!.body!)
  })

  test('escape closes the file, then goes up a level', async ({ page }) => {
    await openDir(page, '/projects')
    const filePath = '/projects/cloud-security-tools'
    await activate(page, filePath)
    await expect.poll(async () => (await getState(page)).openFilePath).toBe(filePath)

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('terminal-file')).toHaveCount(0)
    expect((await getState(page)).currentPath).toBe('/projects')

    await page.keyboard.press('Escape')
    await expectPath(page, '/')
  })

  test('breadcrumb root returns to /', async ({ page }) => {
    await openDir(page, '/skills')
    await page.getByTestId('fsn-crumb-/').click()
    await expectPath(page, '/')
    await expect(page.getByTestId('fsn-up')).toBeDisabled()
  })

  test('up button goes up one level', async ({ page }) => {
    await openDir(page, '/projects')
    await page.getByTestId('fsn-up').click()
    await expectPath(page, '/')
    await expect(page.getByTestId('fsn-up')).toBeDisabled()
  })

  test('hovering a pedestal sets hoveredPath', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'no hover on touch devices')
    const point = await settledPosition(page, '/skills')
    await page.mouse.move(point.x - 20, point.y - 20)
    await page.mouse.move(point.x, point.y, { steps: 5 })
    await expect.poll(async () => (await getState(page)).hoveredPath).toBe('/skills')
    await page.mouse.move(2, 2, { steps: 5 })
    await expect.poll(async () => (await getState(page)).hoveredPath).toBeNull()
  })

  test('hovering a file shows the info card', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'no hover on touch devices')
    await openDir(page, '/skills')
    const filePath = '/skills/cloud.txt'
    const point = await settledPosition(page, filePath)
    await page.mouse.move(point.x - 20, point.y - 20)
    await page.mouse.move(point.x, point.y, { steps: 5 })
    const card = page.getByTestId('fsn-file-info')
    await expect(card).toBeVisible()
    await expect(card).toContainText('cloud.txt')
    await expect(card).toContainText(`size: ${findNode(filePath)!.size} bytes`)
    await expect(card).toContainText('perm: -rw-r--r--')
    await expect(card).toContainText(`path: ${filePath}`)
    await expect(page.getByTestId('fsn-hover-path')).toHaveText(filePath)
    await page.mouse.move(2, 2, { steps: 5 })
    await expect(card).toHaveCount(0)
    await expect(page.getByTestId('fsn-hover-path')).toHaveCount(0)
  })

  test('double-clicking a .lnk file opens the external link', async ({ page, context }) => {
    await context.route(/^https:\/\/(www\.)?github\.com\//, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<title>stub</title>' }),
    )
    await openDir(page, '/links')
    const popupPromise = context.waitForEvent('page')
    await activate(page, '/links/github.lnk')
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded')
    expect(popup.url().startsWith('https://github.com')).toBe(true)
    await expect(page.getByTestId('terminal-file')).toContainText('cat /links/github.lnk')
  })

  test('terminal minimize and restore / mobile defaults', async ({ page }, testInfo) => {
    const panel = page.getByTestId('terminal-panel')
    if (testInfo.project.name === 'mobile') {
      await expect(panel).toHaveAttribute('data-minimized', 'true')
      await openDir(page, '/skills')
      await expect(page.getByTestId('fsn-breadcrumb')).toContainText('skills')
      await page.getByTestId('terminal-restore').click()
      await expect(panel).toHaveAttribute('data-minimized', 'false')
    } else {
      await expect(panel).toHaveAttribute('data-minimized', 'false')
      await page.getByTestId('terminal-minimize').click()
      await expect(panel).toHaveAttribute('data-minimized', 'true')
      await page.getByTestId('terminal-restore').click()
      await expect(panel).toHaveAttribute('data-minimized', 'false')
    }
  })

  test('opening a file un-minimizes the terminal', async ({ page }) => {
    await page.evaluate(() => window.__fsn!.openFile('/skills/cloud.txt'))
    await expect(page.getByTestId('terminal-panel')).toHaveAttribute('data-minimized', 'false')
    await expect(page.getByTestId('terminal-file')).toContainText('cat /skills/cloud.txt')
  })

  test('no console errors or page errors across a navigation flow', async ({ page }) => {
    const problems: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text())
    })
    page.on('pageerror', (error) => problems.push(error.message))

    await openDir(page, '/projects')
    await activate(page, '/projects/devops-pipelines')
    await expect(page.getByTestId('terminal-file')).toBeVisible()
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    await expectPath(page, '/')
    await openDir(page, '/skills')
    await page.getByTestId('fsn-up').click()
    await expectPath(page, '/')
    await page.waitForTimeout(500)
    expect(problems).toEqual([])
  })

  test('every top-level pedestal is reachable by a real double-click from the root overview', async ({ page }) => {
    for (const path of ['/about', '/projects', '/skills', '/links']) {
      await openDir(page, path)
      await page.getByTestId('fsn-crumb-/').click()
      await expectPath(page, '/')
    }
  })

  test('a single canvas survives repeated navigation', async ({ page }) => {
    for (const path of ['/about', '/projects', '/skills', '/links']) {
      await page.evaluate((target) => window.__fsn!.navigateTo(target), path)
      await expectPath(page, path)
      await page.getByTestId('fsn-crumb-/').click()
      await expectPath(page, '/')
    }
    await expect(page.locator('canvas')).toHaveCount(1)
    await expect(page.getByTestId('fsn-breadcrumb')).toHaveCount(1)
  })

  // How many of the root's children share an x-column with another child, and their y spread
  async function rootColumnStats(page: Page) {
    const children = ['/about', '/projects', '/skills', '/links']
    await settledPosition(page, '/')
    const positions: Point[] = []
    for (const child of children) positions.push(await settledPosition(page, child))
    const xValues = positions.map((position) => position.x)
    const yValues = positions.map((position) => position.y)
    const sharedColumns = xValues.filter((value, index) =>
      xValues.some((other, otherIndex) => otherIndex !== index && Math.abs(other - value) < 40),
    ).length
    return { sharedColumns, ySpread: Math.max(...yValues) - Math.min(...yValues) }
  }

  test('portrait lays the root children out as a 2x2 grid, landscape as one row', async ({ page }, testInfo) => {
    const stats = await rootColumnStats(page)
    if (testInfo.project.name === 'mobile') {
      // two columns, two rows
      expect(stats.sharedColumns).toBe(4)
      expect(stats.ySpread).toBeGreaterThan(40)
    } else {
      expect(stats.sharedColumns).toBe(0)
    }
  })

  test('rotating between portrait and landscape re-lays out and keeps the path', async ({ page }) => {
    const goTo = async (path: string) => {
      await page.evaluate((target) => window.__fsn!.navigateTo(target), path)
      await expectPath(page, path)
    }
    const problems: string[] = []
    page.on('pageerror', (error) => problems.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text())
    })
    await page.setViewportSize({ width: 390, height: 844 })
    expect((await rootColumnStats(page)).sharedColumns).toBe(4)
    await goTo('/skills')
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(page.getByTestId('fsn-breadcrumb')).toContainText('skills')
    await goTo('/')
    expect((await rootColumnStats(page)).sharedColumns).toBe(0)
    await goTo('/skills')
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByTestId('fsn-breadcrumb')).toContainText('skills')
    await goTo('/')
    expect((await rootColumnStats(page)).sharedColumns).toBe(4)
    expect(problems).toEqual([])
  })
})

test.describe('fsn spotlight', () => {
  // The leaning beam is aimed at the block's top face: check the block's corners against the
  // beam's cross-section from the pedestal up to the block's top
  test('every file block, however tall, stands inside its leaning beam', () => {
    const steps = 20
    for (const mode of ['tidy', 'grid'] as const) {
      for (const [path, entry] of computeLayout(fsTree, mode)) {
        if (entry.kind !== 'file') continue
        for (let step = 0; step <= steps; step++) {
          const height = (entry.height * step) / steps
          const axisOffset = beamAxisOffsetAt(entry.height, height)
          const farthestCorner = Math.hypot(entry.width / 2 + Math.abs(axisOffset), entry.depth / 2)
          expect(beamRadiusAt(entry.width, height), `${mode} ${path} at ${height.toFixed(2)}`).toBeGreaterThan(
            farthestCorner,
          )
        }
      }
    }
  })

  // The beam's top must stay out of sight: every file view looks down more steeply than half
  // the field of view, so nothing above the camera is on screen
  test('the beam rises above the camera in every file view', async ({ page }) => {
    test.setTimeout(240_000)
    await waitForScene(page)
    const viewport = page.viewportSize()!
    const layout = computeLayout(fsTree, layoutModeFor(viewport.height >= viewport.width))
    for (const [path, entry] of layout) {
      if (entry.kind !== 'file') continue
      await page.evaluate((target) => window.__fsn!.navigateTo(target), path)
      await expect.poll(async () => (await getState(page)).selectedPath).toBe(path)
      const [, cameraHeight] = await settledCamera(page)
      const pedestal = layout.get(entry.parentPath)!
      const surface = pedestal.position[1] + pedestal.height / 2
      expect(cameraHeight, path).toBeLessThan(surface + BEAM_HEIGHT - 1)
    }
  })
})

test.describe('fsn file icons', () => {
  test('every file gets the icon for its type', () => {
    const files: FsNode[] = []
    const collect = (node: FsNode) => {
      if (node.type === 'file') files.push(node)
      node.children?.forEach(collect)
    }
    collect(fsTree)
    expect(files.length).toBeGreaterThan(0)
    for (const file of files) {
      const expected = file.name.endsWith('.lnk') ? 'link' : file.name.includes('.') ? 'document' : 'project'
      expect(iconKindFor(file.name), file.path).toBe(expected)
    }
    expect(files.filter((file) => file.path.startsWith('/projects/')).map((file) => iconKindFor(file.name))).toEqual(
      expect.arrayContaining(['project']),
    )
    expect(iconKindFor('github.lnk')).toBe('link')
    expect(iconKindFor('bio.txt')).toBe('document')
  })
})
