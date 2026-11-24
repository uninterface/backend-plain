import { test, expect } from '@playwright/test'
import { createUiTest } from '@uninterface/testing/playwright'
import type { Locator, Page } from '@playwright/test'
import { uiTestAdapter } from './index'
import type { mount as mountProgress } from '../../../tests/fixtures/progress-bar'
import type { mount as mountSurfaces } from '../../../tests/fixtures/disabled-surfaces'
import { build } from './fixture-build.mjs'
import {
  openPresentationFixture,
  measureSurfacePaint,
} from '../../../tests/presentation-browser-fixture.mjs'

type ProgressPage = Window & {
  fixture: Awaited<ReturnType<typeof mountProgress>>
}
type SurfacesPage = Window & {
  fixture: Awaited<ReturnType<typeof mountSurfaces>>
}

test('suggestions give loading and empty feedback the option row insets', async ({
  page,
}) => {
  await page.clock.install({ time: 0 })
  await page.clock.pauseAt(60_000)
  await page.goto('/#/features/examples/search')
  const input = page.getByRole('combobox', {
    name: 'Suggested name',
    exact: true,
  })
  const popup = page.locator('.plain-suggestions')
  const status = popup.getByRole('status')
  const option = popup.getByRole('option', { name: 'Birch', exact: true })
  const insets = (row: Locator) =>
    row.evaluate((node) => {
      const style = getComputedStyle(node)
      return [
        style.paddingBlockStart,
        style.paddingInlineStart,
        style.paddingBlockEnd,
        style.paddingInlineEnd,
      ].map(Number.parseFloat)
    })

  await input.fill('Bir')
  await page.clock.runFor(525)
  await expect(status).toHaveText('Loading entries…')
  await expect(status).toBeVisible()
  await expect(popup).not.toHaveCSS('box-shadow', 'none')
  const loadingInsets = await insets(status)
  expect(Math.min(...loadingInsets)).toBeGreaterThan(0)

  await page.clock.runFor(400)
  await expect(option).toBeVisible()
  expect(await insets(option)).toEqual(loadingInsets)
  await input.fill('alto')
  await page.clock.runFor(525)
  await expect(status).toHaveText('Updating suggestions…')
  await expect(status).toHaveCSS('border-block-start-width', '1px')
  await page.clock.runFor(400)
  await expect(status).toHaveText('No matches.')
  expect(await insets(status)).toEqual(loadingInsets)
})

test('progress colors use the native semantic palette', async ({ page }) => {
  await openPresentationFixture(
    page,
    build,
    new URL('../../../tests/fixtures/progress-bar.ts', import.meta.url),
    'ProgressBars',
  )
  const ui = createUiTest(page, uiTestAdapter)
  const bar = page.locator('#standalone')
  for (const color of [
    'primary',
    'success',
    'danger',
    'warning',
    'info',
    'secondary',
  ] as const) {
    await page.evaluate(async (color) => {
      const { fixture } = window as unknown as ProgressPage
      fixture.color.value = color
      await fixture.tick()
    }, color)
    const token = '--plain-' + color
    const expected = await bar.evaluate(
      (root, cssColor) => {
        const sample = document.createElement('span')
        sample.style.backgroundColor = cssColor
        root.append(sample)
        const paint = getComputedStyle(sample).backgroundColor
        sample.remove()
        return paint
      },
      'var(' + token + ')',
    )
    expect(
      await ui
        .progressBar(bar)
        .fill.evaluate((node) => getComputedStyle(node).backgroundColor),
    ).toBe(expected)
  }
})

async function focusedPaint(
  page: Page,
  name: 'frame' | 'upload',
  surface: Locator,
) {
  expect(
    await page.evaluate(
      (name) => (window as unknown as SurfacesPage).fixture.focus(name),
      name,
    ),
  ).toBe(true)
  await page.evaluate(async () => {
    await (window as unknown as SurfacesPage).fixture.flush()
    for (const animation of document.getAnimations())
      if (Number.isFinite(animation.effect?.getComputedTiming().endTime))
        animation.finish()
  })
  return measureSurfacePaint(surface)
}

test('upload and input frame use coordinated native focus paint', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPresentationFixture(
    page,
    build,
    new URL('../../../tests/fixtures/disabled-surfaces.ts', import.meta.url),
    'Surfaces',
  )
  const ui = createUiTest(page, uiTestAdapter)
  const frameRoot = page.locator('[data-surface=frame] [data-ui-input-frame]')
  const uploadRoot = page.locator(
    '[data-surface=upload] [data-ui-upload-region]',
  )
  const frameSurface = ui.inputFrame(frameRoot).surface
  for (const mode of ['light', 'dark'] as const)
    for (const retained of [false, true]) {
      await page.evaluate(
        async ({ mode, retained }) => {
          const { fixture } = window as unknown as SurfacesPage
          fixture.mode(mode)
          await fixture.retained(retained)
        },
        { mode, retained },
      )
      const frame = await focusedPaint(page, 'frame', frameSurface)
      const upload = await focusedPaint(
        page,
        'upload',
        (await ui.uploadRegion(uploadRoot)).surface,
      )
      for (const key of [
        'outlineColor',
        'outlineWidth',
        'outlineStyle',
        'outlineOffset',
      ] as const)
        expect(upload[key]).toBe(frame[key])
    }
})

test('feedback footer uses its native action direction', async ({ page }) => {
  await page.goto('/tests/fixtures/floating-feedback.html')
  for (const kind of ['toast', 'notification'] as const) {
    await page.evaluate(async (kind) => {
      window.floating.dispose()
      window.floating = await window.mountFloatingFeedback(
        { duration: null },
        kind,
      )
      window.floating.route.send({
        message: 'Action check',
        actions: [
          { key: 'first', label: 'First' },
          { key: 'next', label: 'Next' },
        ],
      })
    }, kind)
    await expect(page.locator('[data-ui-footer-actions]')).toHaveCSS(
      'flex-direction',
      'row-reverse',
    )
  }
})
