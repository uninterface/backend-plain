import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/temporal-browser.ts', import.meta.url),
)

for (const colorScheme of ['light', 'dark'] as const) {
  test(`Plain temporal ranges retain native interaction and mobile geometry (${colorScheme})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme })
    for (const width of [1100, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await openFixture(page)
      await expect(page.locator('[data-temporal-range]')).toHaveCount(3)
      for (const kind of ['date', 'time', 'datetime']) {
        const range = page.locator(`[data-range=${kind}]`)
        const frame = range.locator('[data-ui-input-frame]')
        const select = range.locator('select[data-temporal-mode]')
        const nativeType = kind === 'datetime' ? 'datetime-local' : kind
        const input = range.locator('input').first()
        await expect(input).toHaveAttribute('type', nativeType)
        await input.focus()
        await expect(frame).toHaveAttribute('data-focused', '')
        await expect(input).toHaveCSS('outline-style', 'none')
        await expect(input.locator('..')).toHaveCSS('outline-style', 'none')
        await select.focus()
        await expect(select).toBeFocused()
        await expect(range.locator('.plain-temporal-mode')).toHaveCSS(
          'outline-style',
          'solid',
        )
        const initial = await frame.boundingBox()
        for (const mode of ['start', 'end', 'unrestricted', 'bounded']) {
          await select.selectOption(mode)
          await expect(range.locator('.plain-temporal-separator')).toBeVisible()
          await expect(range.locator('[data-temporal-infinity]')).toHaveCount(
            mode === 'bounded' ? 0 : mode === 'unrestricted' ? 2 : 1,
          )
          const bounds = await frame.boundingBox()
          expect(Math.abs(bounds!.width - initial!.width)).toBeLessThan(1)
          expect(Math.abs(bounds!.height - initial!.height)).toBeLessThan(2)
          for (const part of await range
            .locator(
              'input, [data-temporal-infinity], [data-temporal-clear], .plain-temporal-separator',
            )
            .all()) {
            const box = await part.boundingBox()
            expect(box!.x).toBeGreaterThanOrEqual(bounds!.x)
            expect(box!.x + box!.width).toBeLessThanOrEqual(
              bounds!.x + bounds!.width + 1,
            )
          }
        }
        if (kind === 'datetime' && width === 390) {
          const start = await range.locator('[data-side=start]').boundingBox()
          const end = await range.locator('[data-side=end]').boundingBox()
          expect(end!.y).toBeGreaterThanOrEqual(start!.y + start!.height)
        }
      }
      await expect(
        page.locator('[data-temporal-trigger], [data-temporal-popup]'),
      ).toHaveCount(0)
      const results = await new AxeBuilder({ page })
        .include('[data-temporal-range]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect(results.violations).toEqual([])
    }
  })
}
