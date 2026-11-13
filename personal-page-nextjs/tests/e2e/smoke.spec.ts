import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

test.describe('smoke', () => {
  // The terminal starts minimized on mobile; restore it so its content is visible.
  async function ensureTerminalOpen(page: Page) {
    const panel = page.getByTestId('terminal-panel')
    await expect(panel).toBeAttached()
    // Retry the click: it can land before React hydrates the handler
    await expect(async () => {
      if ((await panel.getAttribute('data-minimized')) === 'true') {
        await page.getByTestId('terminal-restore').click()
      }
      await expect(panel).toHaveAttribute('data-minimized', 'false', { timeout: 1000 })
    }).toPass({ timeout: 15_000 })
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('h1').first()).not.toBeEmpty()
  })

  test('terminal typing effect renders text', async ({ page }) => {
    await ensureTerminalOpen(page)
    const commandLine = page.locator('[class*="commandLine"]').first()
    await expect(commandLine).toBeVisible()
    await expect(commandLine).toContainText('cat about_me.txt', { timeout: 10_000 })
  })

  test('cursor is visible and animated', async ({ page }) => {
    const cursor = page.locator('[class*="cursor"]').first()
    await expect(cursor).toBeAttached()
    const animationName = await cursor.evaluate((el) => getComputedStyle(el).animationName)
    expect(animationName).not.toBe('none')
  })

  test('canvas is visible', async ({ page }) => {
    // The scene is lazy-loaded, so wait for the canvas to mount
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible({ timeout: 30_000 })
    // Poll: the box can be briefly null while the lazily loaded scene settles
    await expect
      .poll(async () => (await canvas.boundingBox())?.width ?? 0, { timeout: 15_000 })
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await canvas.boundingBox())?.height ?? 0, { timeout: 15_000 })
      .toBeGreaterThan(0)
  })

  test('WebGL is available', async ({ page }) => {
    await page.locator('canvas').first().waitFor({ state: 'attached', timeout: 15_000 })
    const hasWebGL = await page.evaluate(() => {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl2') || c.getContext('webgl'))
    })
    expect(hasWebGL).toBe(true)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))
    await page.reload()
    await page.waitForTimeout(1000)
    expect(errors).toEqual([])
  })

  test('mobile viewport has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await ensureTerminalOpen(page)
    await expect(page.locator('h1').first()).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
