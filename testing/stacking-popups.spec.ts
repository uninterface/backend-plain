import { expect, test } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/stacking-tooltip.ts', import.meta.url),
)

test('Plain registers its tooltip inside the native popover host', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 650 })
  await openFixture(page)
  await page.getByRole('button', { name: 'Open panel' }).click()
  const dialog = page.getByRole('dialog', { name: 'Test panel', exact: true })
  await dialog.getByRole('button', { name: 'Help', exact: true }).hover()
  const tooltip = dialog.getByRole('tooltip', {
    name: 'Nested help',
    exact: true,
  })
  await expect(tooltip).toBeVisible()
  expect(
    await tooltip.evaluate((element) => window.inspectPlainTooltip(element)),
  ).toMatchObject({ exact: true, host: 'popover' })
})
