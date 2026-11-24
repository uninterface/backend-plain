import { expect, test, type Page } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import {
  createUiTest,
  expectContainedFocusPaint,
} from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/native-conformance.ts', import.meta.url),
)
const uiTest = (page: Page) => createUiTest(page, uiTestAdapter)

test('Plain paints inset focus on each segment label', async ({ page }) => {
  await openFixture(page, { scenario: 'segmented-focus' })
  const group = uiTest(page).radioGroup({ name: 'Choices' })
  await expect(group.option('one')).toBeChecked()
  await page.keyboard.press('Tab')
  for (const key of ['one', 'two', 'three']) {
    const option = group.option(key)
    // Programmatic focus exercises unselected paint without changing the selection.
    await option.focus()
    await expect(option).toBeFocused()
    await expectContainedFocusPaint({
      target: option.locator('xpath=ancestor::label[1]'),
      kind: 'outline',
      inset: true,
    })
  }
})
