import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFeedback = createBrowserFixture(
  build,
  new URL('./fixtures/field-feedback-browser.ts', import.meta.url),
)
const openTemporal = createBrowserFixture(
  build,
  new URL('./fixtures/temporal-browser.ts', import.meta.url),
)

const openFields = createBrowserFixture(
  build,
  new URL('./fixtures/field-presentation-browser.ts', import.meta.url),
)

test('Plain blur feedback preserves the pressed submit target', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 })
  await openFeedback(page)
  const name = page.getByRole('textbox', { name: 'Name', exact: true })
  const save = page.getByRole('button', { name: 'Save record', exact: true })
  await name.fill('')
  await save.scrollIntoViewIfNeeded()
  const before = await save.boundingBox()
  expect(before).not.toBeNull()
  const point = {
    x: before!.x + before!.width / 2,
    y: before!.y + before!.height / 2,
  }
  await page.mouse.move(point.x, point.y)
  await page.mouse.down()
  try {
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(
      page
        .locator('.plain-field-feedback')
        .filter({ hasText: 'Name is required.' }),
    ).toHaveClass(/plain-strategy-hidden/)
    // A deliberate hold exposes layout changes between native pointer down/up.
    const after = await save.boundingBox()
    // Subpixel movement is harmless while the pressed target stays under the pointer.
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(1)
    expect(
      await save.evaluate(
        (element, position) =>
          element.contains(document.elementFromPoint(position.x, position.y)),
        point,
      ),
    ).toBe(true)
  } finally {
    await page.mouse.up()
  }
  // A real submit, not background validation, must guide focus back to the issue.
  await expect(
    page
      .locator('.plain-field-feedback')
      .filter({ hasText: 'Name is required.' }),
  ).not.toHaveClass(/plain-strategy-hidden/)
  await expect(name).toBeFocused()
  await expect(page.getByTestId('save-count')).toHaveText('0')
})

test('Plain password and scalar date actions share their input surface', async ({
  page,
}) => {
  await openTemporal(page)
  for (const size of [-1, 0, 1] as const) {
    await page.evaluate(async (size) => {
      await window.plainPresentation.setSize(size)
    }, size)
    for (const label of ['Password']) {
      const input = page.getByLabel(label, { exact: true })
      const surface = input.locator('..')
      await expect(surface).toHaveClass(/plain-text-surface/)
      const bounds = (await surface.boundingBox())!
      const action = surface.locator('button')
      const rect = (await action.boundingBox())!
      expect(rect.x).toBeGreaterThanOrEqual(bounds.x)
      expect(rect.x + rect.width).toBeLessThanOrEqual(bounds.x + bounds.width)
      expect(rect.y).toBeGreaterThanOrEqual(bounds.y)
      expect(rect.y + rect.height).toBeLessThanOrEqual(bounds.y + bounds.height)
      await action.focus()
      await expect
        .poll(() => surface.evaluate((el) => getComputedStyle(el).outlineStyle))
        .toBe('solid')
      expect(
        await action.evaluate((el) => getComputedStyle(el).borderTopWidth),
      ).toBe('0px')
    }
    const date = page.getByLabel('Single date', { exact: true })
    await expect(date).toHaveAttribute('type', 'date')
    await expect(date.locator('..').locator('button')).toHaveCount(0)
    await date.fill('2026-10-23')
    await expect(date).toHaveValue('2026-10-23')
    await expect(page.locator('[data-temporal-popup]')).toHaveCount(0)
    const password = page.getByLabel('Password', { exact: true })
    const before = (await password.locator('..').boundingBox())!
    await page.locator('[data-password-reveal]').click()
    await expect(password).toHaveValue('secret')
    const after = (await password.locator('..').boundingBox())!
    expect(after.height).toBe(before.height)
    expect(after.width).toBe(before.width)
  }
})

test('Plain native date preserves unfinished segments through validation and rerenders', async ({
  page,
}) => {
  await openTemporal(page)
  const date = page.locator('[data-range=date] input[type=date]').first()
  await expect(date).toHaveValue('2026-10-21')
  await date.focus()
  await date.press('ArrowLeft')
  await date.press('Backspace')
  await expect
    .poll(() => date.evaluate((el: HTMLInputElement) => el.validity.badInput))
    .toBe(true)
  await page.getByRole('button', { name: 'Outside date editor' }).click()
  await expect(date).toHaveAttribute('aria-invalid', 'true')
  await page.evaluate(async () => {
    await window.plainPresentation.setSize(-1)
  })
  await expect
    .poll(() => date.evaluate((el: HTMLInputElement) => el.validity.badInput))
    .toBe(true)
  await date.fill('2026-10-20')
  await date.press('Tab')
  await expect(date).not.toHaveAttribute('aria-invalid', 'true')
  await page.evaluate(() => window.plainPresentation.date.field.reset())
  await expect(date).toHaveValue('2026-10-21')
  await expect(page.locator('[data-temporal-popup]')).toHaveCount(0)
})

test('Plain compound frames match ordinary input surfaces at every size', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 })
  await openFields(page)
  const frame = page.locator('[data-ui-input-frame]').first()
  await expect(frame).toBeVisible()
  const reference = page
    .getByRole('textbox', { name: 'Ordinary input', exact: true })
    .locator('xpath=..')
  let previousHeight = 0
  for (const size of ['Small size', 'Default size', 'Large size']) {
    await page.getByRole('button', { name: size, exact: true }).click()
    const style = (element: Element) => {
      const css = getComputedStyle(element)
      return [
        css.borderRadius,
        css.borderTopWidth,
        css.borderTopColor,
        css.paddingTop,
        css.paddingBottom,
        css.paddingLeft,
        css.paddingRight,
        css.fontSize,
        css.minHeight,
      ]
    }
    expect(await frame.evaluate(style)).toEqual(await reference.evaluate(style))
    const height = (await frame.boundingBox())!.height
    expect(height).toBeGreaterThan(previousHeight)
    expect(
      Math.abs(height - (await reference.boundingBox())!.height),
    ).toBeLessThan(1)
    previousHeight = height
    await frame.locator('input').first().focus()
    const focusStyle = (element: Element) => {
      const css = getComputedStyle(element)
      return [css.outlineWidth, css.outlineOffset, css.outlineColor]
    }
    const outline = await frame.evaluate(focusStyle)
    await reference.locator('input').focus()
    expect(outline).toEqual(await reference.evaluate(focusStyle))
  }
})

test('Plain invalid controls own their red border and focus outline without boxing the field', async ({
  page,
}) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme })
    await openFields(page, { scenario: 'invalid' })
    const amount = page.getByRole('textbox', { name: /Amount \(USD\)/ })
    await amount.fill('125.00t')
    await page.getByRole('textbox', { name: 'Reference', exact: true }).focus()
    await expect(amount).toHaveAttribute('aria-invalid', 'true')
    await amount.focus()
    const paint = await amount.evaluate((input) => {
      const field = input.closest('.plain-field')!
      const surface = input.closest('.plain-text-surface')!
      return {
        fieldBorder: getComputedStyle(field).borderTopWidth,
        border: getComputedStyle(surface).borderTopColor,
        outline: getComputedStyle(surface).outlineColor,
        outlineStyle: getComputedStyle(surface).outlineStyle,
        error: getComputedStyle(field.querySelector('.plain-issue')!).color,
      }
    })
    expect(paint.fieldBorder).toBe('0px')
    expect(paint.outlineStyle).toBe('solid')
    expect(paint.border).toBe(paint.error)
    expect(paint.outline).toBe(paint.error)
  }
  await openTemporal(page)
  await page.waitForFunction(() => Boolean(window.plainPresentation))
  await page.evaluate(async () => {
    const control = window.plainPresentation.date.field
    await control.set({ start: 'unfinished', end: '2026-10-23' })
    await control.validate()
  })
  const range = page.locator('[data-range=date]')
  const fallback = range.locator('input').first()
  // External invalid data replaces the native date input with a text editor.
  // locator.focus() does not wait for visible layout, unlike user actions.
  await expect(fallback).toHaveAttribute('type', 'text')
  await expect(fallback).toHaveValue('unfinished')
  await expect(fallback).toBeVisible()
  await fallback.focus()
  await expect(fallback).toBeFocused()
  const paint = await range
    .locator('[data-ui-input-frame]')
    .evaluate((frame) => ({
      border: getComputedStyle(frame).borderTopColor,
      outline: getComputedStyle(frame).outlineColor,
      outlineStyle: getComputedStyle(frame).outlineStyle,
      fieldBorder: getComputedStyle(frame.closest('.plain-field')!)
        .borderTopWidth,
      innerOutline: getComputedStyle(
        frame.querySelector('.plain-text-surface')!,
      ).outlineStyle,
    }))
  expect(paint.outline).toBe(paint.border)
  expect(paint.outlineStyle).toBe('solid')
  expect(paint.fieldBorder).toBe('0px')
  expect(paint.innerOutline).toBe('none')
})

test('Plain fields use layout spacing without blank feedback in cards or navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 })
  await openFields(page, { scenario: 'spacing' })
  const navbar = page.getByRole('navigation', { name: 'Field alignment' })
  await expect(navbar.locator('.plain-field')).toHaveCount(4)
  await expect(navbar.locator('.plain-field-feedback')).toHaveCount(0)
  const navbarHeight = (await navbar.boundingBox())!.height
  const tallField = (await navbar
    .getByRole('textbox', { name: 'Long text' })
    .boundingBox())!
  expect(navbarHeight).toBeGreaterThanOrEqual(tallField.height)
  expect(navbarHeight - tallField.height).toBeLessThan(80)

  const card = page.locator('.plain-card').first()
  const fields = card.locator('.plain-field')
  await expect(fields).toHaveCount(3)
  await expect(card.locator('.plain-field-feedback')).toHaveCount(0)
  for (let index = 0; index < 3; index++) {
    const field = fields.nth(index)
    const box = (await field.boundingBox())!
    const input = (await field.locator('.plain-text-surface').boundingBox())!
    expect(Math.abs(box.y + box.height - input.y - input.height)).toBeLessThan(
      1,
    )
    if (index < 2) {
      const next = (await fields.nth(index + 1).boundingBox())!
      expect(Math.abs(next.y - box.y - box.height - 16)).toBeLessThan(1)
    }
  }
})
