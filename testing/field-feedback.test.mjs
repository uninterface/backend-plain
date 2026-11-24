import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('Plain omits empty feedback and delays blur-driven expansion until the pointer click completes', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/field-feedback.ts', import.meta.url),
    async ({ mountFieldFeedback }, window) => {
      const fixture = await mountFieldFeedback()
      try {
        const doc = window.document
        const tick = () => new Promise((resolve) => setTimeout(resolve, 20))
        const name = [...fixture.host.querySelectorAll('label')].find((label) =>
          label.textContent.includes('Name'),
        ).control
        const field = name.closest('.plain-field')
        const save = [...fixture.host.querySelectorAll('button')].find(
          (button) => button.textContent.trim() === 'Save record',
        )
        const feedback = () => field.querySelector('.plain-field-feedback')
        const edit = async (value) => {
          name.focus()
          name.value = value
          name.dispatchEvent(new window.Event('input', { bubbles: true }))
          await tick()
        }
        const pointer = (type) =>
          save.dispatchEvent(
            new window.PointerEvent(type, {
              bubbles: true,
              button: 0,
              pointerId: 1,
              isPrimary: true,
            }),
          )
        assert.equal(fixture.host.querySelector('.plain-field-feedback'), null)
        await edit('')
        assert.equal(doc.activeElement, name)
        assert.equal(feedback(), null, 'no issue before pointerdown')
        pointer('pointerdown')
        save.focus()
        await tick()
        assert.equal(name.getAttribute('aria-invalid'), 'true')
        assert.ok(feedback().classList.contains('plain-strategy-hidden'))
        assert.ok(!field.classList.contains('plain-invalid'))
        const error = feedback().querySelector('p')
        assert.ok(
          name.getAttribute('aria-describedby').split(' ').includes(error.id),
        )
        assert.equal(error.textContent.trim(), 'Name is required.')
        pointer('pointerup')
        await tick()
        assert.ok(
          feedback().classList.contains('plain-strategy-hidden'),
          'wait for click after pointer release',
        )
        save.click()
        await tick()
        assert.ok(!feedback().classList.contains('plain-strategy-hidden'))
        assert.equal(
          doc.activeElement,
          name,
          'native submit focuses the invalid editor',
        )
        assert.equal(fixture.state.submissions.length, 0)
        await edit('Corrected')
        assert.equal(feedback(), null)
        await edit('')
        save.focus()
        await tick()
        assert.ok(
          !feedback().classList.contains('plain-strategy-hidden'),
          'keyboard blur is immediate',
        )
        assert.deepEqual(Array.from(fixture.state.errors), [])
      } finally {
        fixture.dispose()
      }
    },
  )
})
