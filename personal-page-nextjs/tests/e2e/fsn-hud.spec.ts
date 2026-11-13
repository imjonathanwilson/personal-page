import { test, expect } from '@playwright/test'

test.describe('fsn HUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => Boolean(window.__fsn))
  })

  test('header shows path and stats for the root', async ({ page }) => {
    await expect(page.getByTestId('fsn-header')).toBeVisible()
    await expect(page.getByTestId('fsn-stats')).toContainText('drwxr-xr-x')
    await expect(page.getByTestId('fsn-stats')).toContainText('4 directories, 0 files')
  })

  test('stats follow file selection and navigation', async ({ page }) => {
    await page.evaluate(() => window.__fsn?.openFile('/about/bio.txt'))
    await expect(page.getByTestId('fsn-stats')).toContainText('-rw-r--r--')
    await expect(page.getByTestId('fsn-stats')).toContainText('bytes, 0 days old, text')
    await expect(page.getByTestId('fsn-breadcrumb')).toContainText('bio.txt')
    await page.evaluate(() => window.__fsn?.navigateTo('/skills'))
    await expect(page.getByTestId('fsn-stats')).toContainText('0 directories, 4 files')
    await expect(page.getByTestId('fsn-breadcrumb')).toContainText('skills')
  })

  test('overview navigates on click', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'overview is hidden on mobile')
    await expect(page.getByTestId('fsn-overview')).toBeVisible()
    await page.getByTestId('fsn-overview-node-/skills').click()
    await expect(page.getByTestId('fsn-breadcrumb')).toContainText('skills')
  })

  test('mobile header fits the viewport', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only')
    await expect(page.getByTestId('fsn-header')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    )
    expect(overflow).toBe(true)
  })

  test('pull-down menus open, navigate and close', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'menus are hidden in the compact header')
    const directory = page.getByTestId('fsn-menu-directory')
    await expect(directory).toHaveAttribute('aria-expanded', 'false')
    await directory.click()
    await expect(directory).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('menu', { name: 'Directory' })).toBeVisible()
    await page.getByTestId('fsn-menu-item-directory-dir-skills').click()
    await expect(page.getByTestId('fsn-menu-list-directory')).toHaveCount(0)
    await expect(page.getByTestId('fsn-breadcrumb')).toContainText('skills')

    // Up is enabled now, Esc closes the menu without navigating up
    await directory.click()
    await expect(page.getByTestId('fsn-menu-item-directory-up')).toBeEnabled()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('fsn-menu-list-directory')).toHaveCount(0)
    expect(await page.evaluate(() => window.__fsn?.getState().currentPath)).toBe('/skills')

    // clicking outside closes
    await directory.click()
    await page.getByTestId('fsn-stats').click()
    await expect(page.getByTestId('fsn-menu-list-directory')).toHaveCount(0)

    // arrow keys move through items
    await directory.focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByTestId('fsn-menu-item-directory-up')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByTestId('fsn-menu-item-directory-root')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('fsn-breadcrumb')).not.toContainText('skills')
  })

  test('Display > Bird\'s-eye toggles and File menu follows selection', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'menus are hidden in the compact header')
    await page.getByTestId('fsn-menu-display').click()
    const birdsEye = page.getByTestId('fsn-menu-item-display-birdseye')
    await expect(birdsEye).toHaveAttribute('aria-checked', 'false')
    await birdsEye.click()
    await expect(page.getByTestId('fsn-birdseye')).toHaveAttribute('aria-pressed', 'true')
    await page.getByTestId('fsn-menu-display').click()
    await expect(page.getByTestId('fsn-menu-item-display-birdseye')).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await page.keyboard.press('Escape')

    await page.getByTestId('fsn-menu-file').click()
    await expect(page.getByTestId('fsn-menu-item-file-open')).toBeDisabled()
    await expect(page.getByTestId('fsn-menu-item-file-close')).toBeDisabled()
    await page.keyboard.press('Escape')
    await page.evaluate(() => window.__fsn?.navigateTo('/about/bio.txt'))
    await page.getByTestId('fsn-menu-file').click()
    await page.getByTestId('fsn-menu-item-file-open').click()
    await expect(page.getByTestId('terminal-file')).toBeVisible()
    await page.getByTestId('fsn-menu-file').click()
    await page.getByTestId('fsn-menu-item-file-close').click()
    await expect(page.getByTestId('terminal-file')).toHaveCount(0)

    await page.evaluate(() => window.__fsn?.navigateTo('/skills'))
    await page.getByTestId('fsn-menu-session').click()
    await page.getByTestId('fsn-menu-item-session-reset').click()
    expect(await page.evaluate(() => window.__fsn?.getState().currentPath)).toBe('/')
    await expect(page.getByTestId('fsn-birdseye')).toHaveAttribute('aria-pressed', 'false')
  })

  test('Show > Terminal minimizes and restores; Help dialog opens and closes', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'menus are hidden in the compact header')
    const panel = page.getByTestId('terminal-panel')
    await expect(panel).toHaveAttribute('data-minimized', 'false')
    await page.getByTestId('fsn-menu-show').click()
    await page.getByTestId('fsn-menu-item-show-terminal').click()
    await expect(panel).toHaveAttribute('data-minimized', 'true')

    await page.getByTestId('fsn-menu-help').click()
    await page.getByTestId('fsn-menu-item-help-about').click()
    await expect(page.getByTestId('fsn-about')).toContainText('recreation of SGI')
    await page.getByTestId('fsn-about-close').click()
    await expect(page.getByTestId('fsn-about')).toHaveCount(0)
    await page.getByTestId('fsn-menu-help').click()
    await page.getByTestId('fsn-menu-item-help-about').click()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('fsn-about')).toHaveCount(0)
  })

  test('keyboard nav lists the directory and opens files', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'keyboard test')
    const list = page.getByTestId('fsn-keyboard-nav')
    for (let press = 0; press < 12; press += 1) {
      await page.keyboard.press('Tab')
      if (await list.evaluate((element) => element === document.activeElement)) break
    }
    await expect(list).toBeFocused()
    await expect(list).toBeVisible()
    // root has four directories; first child is active, so Enter enters it
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    const state = await page.evaluate(() => window.__fsn?.getState())
    expect(state?.currentPath).not.toBe('/')
    // go to a known directory and file
    await page.evaluate(() => window.__fsn?.navigateTo('/about'))
    await expect(page.getByTestId('fsn-keyboard-nav-/about/bio.txt')).toBeVisible()
    await list.focus()
    await page.keyboard.press('End')
    const lastKey = await page.evaluate(
      () => document.querySelector('[data-testid="fsn-keyboard-nav"]')?.getAttribute('aria-activedescendant'),
    )
    expect(lastKey).toContain('fsn-kbd-/about/')
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowDown') // ".." then first file
    await page.keyboard.press('Enter')
    expect(await page.evaluate(() => window.__fsn?.getState().openFilePath)).toBeNull()
    expect(await page.evaluate(() => window.__fsn?.getState().selectedPath)).toMatch(/^\/about\/.+\./)
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('terminal-file')).toBeVisible()
  })

  test('focused keyboard listbox does not block the Session trigger', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'menus are hidden in the compact header')
    const list = page.getByTestId('fsn-keyboard-nav')
    await list.focus()
    await expect(list).toBeVisible()
    const headerBottom = await page
      .getByTestId('fsn-header')
      .evaluate((element) => element.getBoundingClientRect().bottom)
    const listTop = await list.evaluate((element) => element.getBoundingClientRect().top)
    expect(listTop).toBeGreaterThanOrEqual(headerBottom - 1)
    await page.getByTestId('fsn-menu-session').click()
    await expect(page.getByTestId('fsn-menu-session')).toHaveAttribute('aria-expanded', 'true')
  })

  test('About dialog is modal and Tab stays inside it', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'menus are hidden in the compact header')
    await page.getByTestId('fsn-menu-help').click()
    await page.getByTestId('fsn-menu-item-help-about').click()
    const dialog = page.getByTestId('fsn-about')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    const close = page.getByTestId('fsn-about-close')
    await expect(close).toBeFocused()
    for (const key of ['Tab', 'Tab', 'Shift+Tab']) {
      await page.keyboard.press(key)
      const inside = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('[data-testid="fsn-about"]')),
      )
      expect(inside).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(page.getByTestId('fsn-menu-help')).toBeFocused()
  })

  test('clicking the canvas while a menu is open only closes the menu', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'menus are hidden in the compact header')
    await page.waitForFunction(() => Boolean(window.__fsn?.screenPosition?.('/skills')))
    const point = await page.evaluate(() => window.__fsn?.screenPosition?.('/skills') ?? null)
    expect(point).not.toBeNull()
    const target = point as { x: number; y: number }
    const hitTag = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.tagName,
      target,
    )
    expect(hitTag).toBe('CANVAS')
    const before = await page.evaluate(() => window.__fsn?.getState())
    await page.getByTestId('fsn-menu-directory').click()
    await expect(page.getByTestId('fsn-menu-list-directory')).toBeVisible()
    await page.mouse.click(target.x, target.y)
    await expect(page.getByTestId('fsn-menu-list-directory')).toHaveCount(0)
    await page.waitForTimeout(300)
    const after = await page.evaluate(() => window.__fsn?.getState())
    expect(after?.selectedPath).toBe(before?.selectedPath)
    expect(after?.currentPath).toBe(before?.currentPath)
  })

  test('desktop: minimize then open a file gives a full-height side panel', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'desktop only')
    await page.setViewportSize({ width: 1024, height: 640 })
    await page.getByTestId('terminal-minimize').click()
    await page.evaluate(() => window.__fsn?.openFile('/about/bio.txt'))
    const box = await page.getByTestId('terminal-panel').boundingBox()
    expect(box?.height).toBeGreaterThan(640 * 0.5)
    expect(box?.width).toBeLessThan(1024 * 0.9)
  })
})

test.describe('fsn HUD: landscape phone', () => {
  test.use({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true })

  test('terminal is minimized and header controls are visible and tappable', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => Boolean(window.__fsn))
    await expect(page.getByTestId('terminal-panel')).toHaveAttribute('data-minimized', 'true')
    for (const testId of ['fsn-up', 'fsn-birdseye', 'fsn-crumb-/', 'terminal-restore']) {
      const target = page.getByTestId(testId)
      await expect(target).toBeVisible()
      const result = await target.evaluate((element) => {
        const box = element.getBoundingClientRect()
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        return {
          box: JSON.stringify(box),
          inside:
            box.left >= 0 && box.top >= 0 &&
            box.right <= window.innerWidth && box.bottom <= window.innerHeight,
          reachable: hit === element || element.contains(hit) || Boolean(hit?.contains(element)),
        }
      })
      expect(result, `${testId} ${result.box}`).toMatchObject({ inside: true, reachable: true })
    }
    const headerHeight = await page.getByTestId('fsn-header').evaluate((element) => element.getBoundingClientRect().height)
    expect(headerHeight).toBeLessThan(390 / 3)
  })
})

test.describe('fsn HUD: terminal header dots', () => {
  for (const viewport of [null, { width: 844, height: 390 }]) {
    test(`dots share a centre line (${viewport ? 'landscape' : 'portrait'})`, async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, 'mobile only')
      if (viewport) await page.setViewportSize(viewport)
      await page.goto('/')
      await page.waitForFunction(() => Boolean(window.__fsn))
      const centres = await page.getByTestId('terminal-minimize').evaluate((yellow) => {
        const dots = Array.from(yellow.parentElement?.children ?? [])
        return dots.map((dot) => {
          const box = dot.getBoundingClientRect()
          return box.top + box.height / 2
        })
      })
      expect(centres).toHaveLength(3)
      expect(Math.max(...centres) - Math.min(...centres)).toBeLessThanOrEqual(2)
    })
  }
})

test.describe('fsn HUD: touch targets', () => {
  test('mobile controls are at least 36px', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only')
    await page.goto('/')
    await page.waitForFunction(() => Boolean(window.__fsn))
    await page.evaluate(() => window.__fsn?.navigateTo('/skills'))
    for (const testId of ['fsn-up', 'fsn-birdseye', 'fsn-crumb-/', 'fsn-crumb-/skills', 'terminal-minimize', 'terminal-restore']) {
      const box = await page.getByTestId(testId).boundingBox()
      expect(box?.width, `${testId} width`).toBeGreaterThanOrEqual(36)
      expect(box?.height, `${testId} height`).toBeGreaterThanOrEqual(36)
    }
  })
})
