import { test, expect } from '@playwright/test'
import { createUiTest } from '@uninterface/testing/playwright'
import type { Locator, Page } from '@playwright/test'
import { uiTestAdapter } from './index'
import type { mount as mountProgress } from './fixtures/progress-bar'
import type { mount as mountSurfaces } from './fixtures/disabled-surfaces'
import { build } from './fixture-build.mjs'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import type { send } from './fixtures/feedback-actions'

const openProgress = createBrowserFixture(
  build,
  new URL('./fixtures/progress-bar.ts', import.meta.url),
)
const openSurfaces = createBrowserFixture(
  build,
  new URL('./fixtures/disabled-surfaces.ts', import.meta.url),
)
const openFeedback = createBrowserFixture(
  build,
  new URL('./fixtures/feedback-actions.ts', import.meta.url),
)
const openSuggestions = createBrowserFixture(
  build,
  new URL('./fixtures/suggestions.ts', import.meta.url),
)

type ProgressPage = Window & {
  Fixture: { mount: typeof mountProgress }
  fixture: Awaited<ReturnType<typeof mountProgress>>
}
type SurfacesPage = Window & {
  Fixture: { mount: typeof mountSurfaces }
  fixture: Awaited<ReturnType<typeof mountSurfaces>>
}

test('suggestions give loading and empty feedback the option row insets', async ({
  page,
}) => {
  await page.clock.install({ time: 0 })
  await page.clock.pauseAt(60_000)
  await openSuggestions(page)
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
  await openProgress(page)
  await page.evaluate(async () => {
    const surface = window as unknown as ProgressPage
    surface.fixture = await surface.Fixture.mount()
  })
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
  await openSurfaces(page)
  await page.evaluate(async () => {
    const surface = window as unknown as SurfacesPage
    surface.fixture = await surface.Fixture.mount()
  })
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
  await openFeedback(page)
  for (const kind of ['toast', 'notification'] as const) {
    await page.evaluate((kind) => {
      return (
        window as unknown as { Fixture: { send: typeof send } }
      ).Fixture.send(kind)
    }, kind)
    await expect(page.locator('[data-ui-footer-actions]')).toHaveCSS(
      'flex-direction',
      'row-reverse',
    )
  }
})

/** Report actual surface paint after the fixture's normal focus transition. */
function measureSurfacePaint(surface: Locator) {
  return surface.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      tag: element.tagName,
      classes: element.className,
      backgroundColor: style.backgroundColor,
      color: style.color,
      borderColor: style.borderColor,
      opacity: style.opacity,
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      outlineOffset: style.outlineOffset,
      boxShadow: style.boxShadow,
    }
  })
}
