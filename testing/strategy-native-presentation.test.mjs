import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createUiDomTest } from '@uninterface/testing/dom'
import { withStrategies, settleUntil } from './strategy-fixture.mjs'
import { build } from './fixture-build.mjs'
import { uiDomTestAdapter } from './dom.mjs'
test('strategies retain native sizing, labels, annotations and feedback', () =>
  withStrategies(build, async (example, window) => {
    const ui = createUiDomTest(uiDomTestAdapter)
    const target = example.host.querySelector('[data-strategy-target="text"]')
    const input = target.matches('input')
      ? target
      : target.querySelector('input')
    input.focus()
    const button = example.host.querySelector('[data-strategy-target="button"]')
    {
      assert.ok(
        input.closest('.plain-input').classList.contains('plain-size-small'),
      )
      assert.ok(button.classList.contains('plain-size-small'))
      assert.ok(input.closest('.plain-labels-beside'))
      assert.equal(example.host.textContent.includes('Optional'), false)
      const legend = example.host.querySelector('[data-strategy-group] legend')
      assert.ok(legend.textContent.includes('Required group'))
      assert.ok(
        legend
          .querySelector('.plain-strategy-hidden')
          .textContent.includes('Required'),
      )
      assert.equal(legend.querySelector('.plain-required'), null)
      example.text.state.issue = 'Fix this value'
      await example.tick()
      assert.equal(example.host.textContent.includes('Keep helping'), false)
      assert.equal(
        input.getAttribute('aria-describedby').includes('-help'),
        false,
      )
      example.text.state.issue = null
      await example.tick()
      assert.equal(example.host.textContent.includes('Keep helping'), true)
    }
    const backendPrefix = 'plain'
    const originalLabels = example.state.labels
    for (const labels of [originalLabels, undefined]) {
      example.state.labels = labels
      for (const mode of ['prefix', 'suffix', 'no', 'yes']) {
        example.state.requiredAnnotations = mode
        await example.tick()
        for (const controlName of [
          'text',
          'form-editor',
          'checkbox',
          'switch',
          'select',
        ]) {
          const control = example.host.querySelector(
            `[data-strategy-target="${controlName}"]`,
          )
          const field = control.closest(`.${backendPrefix}-field`)
          assert.ok(field, `${controlName} has a field`)
          const markers = field.querySelectorAll(`.${backendPrefix}-required`)
          if (mode === 'no') {
            assert.equal(
              markers.length,
              0,
              `${controlName}: no visible required annotation`,
            )
          } else {
            assert.equal(
              markers.length,
              1,
              `${controlName}: one required annotation`,
            )
            if (markers.length) {
              const marker = markers[0]
              const visibleLabelText = [
                ...marker.parentElement.childNodes,
              ].filter((node) => node.nodeType === 3 && node.textContent.trim())
              assert.ok(visibleLabelText.length)
              const beforeText = Boolean(
                marker.compareDocumentPosition(visibleLabelText[0]) &
                  window.Node.DOCUMENT_POSITION_FOLLOWING,
              )
              assert.equal(
                beforeText,
                mode === 'prefix' || false,
                `${controlName}: annotation placement`,
              )
            }
          }
        }
        const group = example.host.querySelector('[data-strategy-group]')
        assert.equal(
          group.querySelector(`.${backendPrefix}-required`),
          null,
          'query barrier preserves local no annotation',
        )
      }
    }
    example.state.blockRequiredGroup = false
    const groupField = example.host.querySelector('[data-strategy-group]')
    assert.ok(
      ui.fieldGroup(groupField).label?.textContent.includes('Required group'),
    )
    assert.ok(ui.fieldGroup(groupField).controlArea)
    for (const mode of ['prefix', 'suffix', 'yes', 'no']) {
      example.state.requiredAnnotations = mode
      await example.tick()
      const marker = groupField.querySelector(`.${backendPrefix}-required`)
      assert.equal(
        Boolean(marker),
        mode !== 'no',
        'group annotation follows its own strategy query',
      )
      const requiredDescription = groupField.querySelector(
        `[id$="-required"], .plain-strategy-hidden`,
      )
      if (mode === 'no')
        assert.ok(
          requiredDescription,
          'group retains semantic required description',
        )
      const optionalField = example.host
        .querySelector('[data-strategy-target="blocked-editor"]')
        .closest(`.${backendPrefix}-field`)
      assert.equal(
        optionalField.querySelector(`.${backendPrefix}-required`),
        null,
        'optional field receives no annotation',
      )
    }
    example.state.blockRequiredGroup = true
    example.state.labels = originalLabels
    example.state.requiredAnnotations = 'yes'
    await example.tick()
    for (const level of [-2, -1, 0, 1, 2]) {
      example.state.size = level
      await example.tick()
      {
        assert.equal(
          input.closest('.plain-input').classList.contains('plain-size-small'),
          level < 0,
        )
        assert.equal(
          input.closest('.plain-input').classList.contains('plain-size-large'),
          level > 0,
        )
      }
      {
        assert.equal(
          Boolean(input.closest('.plain-field-size-small')),
          level < 0,
        )
        assert.equal(
          Boolean(input.closest('.plain-field-size-large')),
          level > 0,
        )
      }
    }
    example.state.size = -1
    for (const limit of ['fieldOnly', 'sizeDepth']) {
      example.state[limit] = limit === 'fieldOnly' ? true : 1
      await example.tick()
      {
        assert.ok(input.closest('.plain-field-size-small'))
        assert.equal(
          input.closest('.plain-input').classList.contains('plain-size-small'),
          false,
        )
      }
      example.state[limit] = limit === 'fieldOnly' ? false : undefined
    }
    await example.tick()
    for (const [name, control] of [
      ['text', example.text],
      ['checkbox', example.checkbox],
      ['select', example.selected],
    ]) {
      const surface = example.host.querySelector(
        `[data-strategy-target="${name}"]`,
      )
      const editor = surface.matches(
        'input,select,[role=checkbox],[role=combobox]',
      )
        ? surface
        : surface.querySelector(
            'input:not([type=hidden]),select,[role=checkbox],[role=combobox]',
          )
      control.state.issue = `Failure for ${name}`
      for (const mode of ['none', 'show-tooltip']) {
        example.state.failure = mode
        await example.tick()
        await settleUntil(
          example.tick,
          () =>
            mode === 'none'
              ? !ui.fieldFeedback(editor).message
              : ui.fieldFeedback(editor).tooltip,
          `native validation for ${name}/${mode}`,
        )
        const { message } = ui.fieldFeedback(editor)
        if (mode === 'none') {
          assert.ok(
            editor.closest('.plain-invalid'),
            `${name}: none retains native visual invalidity`,
          )
        } else {
          {
            assert.ok(
              message.className.includes('tooltip-description'),
              'stable accessible error description survives portal lifecycle',
            )
          }
        }
      }
      control.state.issue = null
      await control.validate()
      await example.tick()
    }
    for (const position of ['above', 'beside', 'beside-far', 'beside-near']) {
      example.state.labels = position
      await example.tick()
      {
        const prefix = 'plain'
        assert.equal(
          Boolean(input.closest(`.${prefix}-labels-beside`)),
          position.startsWith('beside'),
          'beside requests resolve to a concrete beside alignment',
        )
      }
    }
    const checkableFields = [
      ...example.host.querySelectorAll('.plain-field'),
    ].filter((field) =>
      ['Strategy checkbox', 'Strategy switch'].some((label) =>
        field.textContent.includes(label),
      ),
    )
    for (const position of [
      undefined,
      'show',
      'above',
      'beside',
      'beside-far',
      'beside-near',
      'floating',
    ]) {
      example.state.labels = position
      await example.tick()
      for (const field of checkableFields) {
        {
          assert.ok(field.classList.contains('plain-checkable-field'))
          assert.ok(!field.classList.contains('plain-labels-beside'))
          assert.ok(!field.querySelector('.plain-label.plain-strategy-hidden'))
        }
      }
    }
    for (const position of ['show', 'floating', 'hidden', undefined]) {
      example.state.labels = position
      await example.tick()
      for (const name of ['text', 'select', 'checkbox', 'switch']) {
        const surface = example.host.querySelector(
          `[data-strategy-target="${name}"]`,
        )
        const editor = surface.matches(
          'input,select,[role=checkbox],[role=switch],[role=combobox]',
        )
          ? surface
          : surface.querySelector(
              'input:not([type=hidden]),select,[role=checkbox],[role=switch],[role=combobox]',
            )
        if (position === 'hidden' && !['checkbox', 'switch'].includes(name)) {
          const field = editor.closest('.plain-field')
          assert.ok(
            field.querySelector('.plain-strategy-hidden'),
            `${name}: hidden retains the native visually hidden label`,
          )
        }
      }
    }
  }))
