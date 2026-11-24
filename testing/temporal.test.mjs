import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Plain preserves native temporal defaults and exposes explicit formats and stable range positions', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/temporal.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'Temporal',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((r) => r.output)
    .find((r) => r.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let demo
  try {
    installDomEnvironment(dom.window)
    const observers = new Set()
    let width = 832
    dom.window.document.documentElement.style.fontSize = '16px'
    const rect = dom.window.HTMLElement.prototype.getBoundingClientRect
    dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
      return this.matches('.plain-temporal-host') ? { width } : rect.call(this)
    }
    dom.window.ResizeObserver = class {
      constructor(callback) {
        this.callback = callback
      }
      observe() {
        observers.add(this)
      }
      disconnect() {
        observers.delete(this)
      }
    }
    dom.window.eval(code)
    demo = await dom.window.Temporal.mount()
    assert.equal(
      demo.host.querySelectorAll('[unbounded], [extendedhours]').length,
      0,
      'Internal temporal flags must not leak into HTML (unbounded is a native attribute)',
    )
    const section = (name) => demo.host.querySelector(`[data-case=${name}]`)
    const input = (name) => section(name).querySelector('input')
    const type = (name, expected) => assert.equal(input(name).type, expected)
    const edit = async (element, value) => {
      element.focus()
      element.value = value
      element.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
      element.blur()
      await demo.tick()
    }
    type('date', 'date')
    type('time', 'time')
    type('datetime', 'datetime-local')
    type('text', 'text')
    type('independent', 'text')
    assert.equal(input('independent').value, '03/02/2026')
    const originalStart = input('range')
    const resize = async (nextWidth) => {
      width = nextWidth
      for (const observer of observers) observer.callback()
      await demo.tick()
    }
    for (const [nextWidth, stacked] of [
      [832, [false, false, false]],
      [400, [true, false, true]],
      [320, [true, true, true]],
    ]) {
      await resize(nextWidth)
      assert.deepEqual(
        ['range', 'timeRange', 'datetimeRange'].map((name) =>
          section(name)
            .querySelector('.plain-temporal-range')
            .hasAttribute('data-stacked'),
        ),
        stacked,
      )
      assert.equal(
        input('range'),
        originalStart,
        'resizing retains the native editor',
      )
    }
    dom.window.document.documentElement.style.fontSize = '20px'
    await resize(480)
    assert.ok(
      section('timeRange').querySelector('[data-stacked]'),
      'breakpoints follow root font size',
    )
    dom.window.document.documentElement.style.fontSize = '16px'
    await resize(832)
    const retainedEnd = section('range').querySelectorAll('input')[1]
    await demo.controls.range.field.set({
      start: 'unfinished',
      end: '2026-03-05',
    })
    await demo.controls.range.field.validate()
    await demo.tick()
    const fallback = input('range')
    assert.equal(fallback.type, 'text')
    assert.equal(fallback.value, 'unfinished')
    await resize(320)
    assert.equal(
      input('range'),
      fallback,
      'resizing retains the invalid draft editor',
    )
    assert.equal(section('range').querySelectorAll('input')[1], retainedEnd)
    demo.controls.range.field.reset()
    await demo.tick()
    type('range', 'date')
    await resize(832)
    for (const [name, nativeType] of [
      ['range', 'date'],
      ['timeRange', 'time'],
      ['datetimeRange', 'datetime-local'],
    ]) {
      const host = section(name)
      const control = demo.controls[name].field
      const initial = JSON.stringify(control.state.input)
      const select = host.querySelector('[data-temporal-mode]')
      assert.equal(select.tagName, 'SELECT', 'retain native mode selection')
      assert.equal(select.options.length, 4)
      assert.ok(
        [...select.options].every(
          (option) => option.textContent.trim().length > 2,
        ),
        'native options retain full labels',
      )
      for (const mode of ['start', 'end', 'unrestricted', 'bounded']) {
        select.focus()
        select.value = mode
        select.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
        await demo.tick()
        assert.equal(dom.window.document.activeElement, select)
        assert.equal(
          host
            .querySelector('.plain-temporal-mode-display')
            .textContent.replace(/\s/g, ''),
          { start: '→▾', end: '←▾', unrestricted: '∞▾', bounded: '↔▾' }[mode],
        )
        assert.equal(
          host.querySelector('.plain-temporal-separator').textContent.trim(),
          '–',
        )
        assert.equal(host.querySelectorAll('[data-side]').length, 2)
        assert.equal(
          host.querySelectorAll('[data-temporal-infinity]').length,
          mode === 'unrestricted' ? 2 : mode === 'bounded' ? 0 : 1,
        )
        assert.ok(host.querySelector('.plain-temporal-spacer'))
        for (const side of ['start', 'end']) {
          const boundary = host.querySelector(`[data-side=${side}]`)
          const unbounded =
            mode === 'unrestricted' ||
            mode === (side === 'start' ? 'end' : 'start')
          if (unbounded)
            assert.ok(
              boundary
                .querySelector('[data-temporal-infinity]')
                ?.getAttribute('aria-label'),
            )
          else assert.equal(boundary.querySelector('input').type, nativeType)
        }
      }
      assert.equal(
        JSON.stringify(control.state.input),
        initial,
        'mode switching retains endpoint drafts',
      )
    }
    const time = section('timeRange')
    const nextDay = () => time.querySelector('[data-temporal-next-day]')
    assert.ok(nextDay().querySelector('svg'))
    assert.ok(nextDay().getAttribute('aria-label'))
    assert.notEqual(nextDay().style.visibility, 'hidden')
    await edit(time.querySelectorAll('input')[1], '23:00')
    assert.equal(nextDay().style.visibility, 'hidden')
    await edit(time.querySelectorAll('input')[1], '22:00')
    assert.notEqual(
      nextDay().style.visibility,
      'hidden',
      'equal clocks represent 24 hours',
    )

    for (const [format, expected] of [
      ['YMD', '2026-03-02'],
      ['DMY', '02/03/2026'],
      ['MDY', '03/02/2026'],
    ]) {
      await demo.format(format)
      type('date', 'text')
      type('datetime', 'text')
      type('time', 'time')
      assert.equal(input('date').value, expected)
      assert.equal(input('datetime').value, expected + ' 09:05')
      assert.equal(input('range').value, expected)
      assert.equal(input('independent').value, '03/02/2026')
    }
    await demo.format('DMY')
    await edit(input('datetime'), '  2/3/2026   12:33:32  ')
    assert.equal(demo.controls.datetime.field.state.input, '2026-03-02T12:33')
    assert.equal(input('datetime').value, '02/03/2026 12:33')
    const range = section('range')
    await edit(input('range'), 'unfinished')
    await demo.controls.range.field.validate()
    await demo.tick()
    assert.ok(range.querySelector('.plain-input-frame-invalid'))
    assert.equal(
      range.querySelectorAll('.plain-text-surface.plain-invalid').length,
      0,
    )
    assert.equal(input('range').getAttribute('aria-invalid'), 'true')
    demo.controls.range.field.reset()
    await demo.tick()
    assert.equal(input('range').value, '02/03/2026')
    await demo.format(undefined)
    type('date', 'date')
    type('datetime', 'datetime-local')
    type('range', 'date')
    assert.equal(input('datetime').value, '2026-03-02T12:33')
    assert.equal(demo.host.querySelector('[data-temporal-popup]'), null)
    assert.equal(demo.host.querySelector('[data-temporal-trigger]'), null)
    const clear = range.querySelector('[data-temporal-clear]')
    await demo.readonly(true)
    assert.ok(
      clear.disabled &&
        range.querySelector('select').disabled &&
        input('range').readOnly,
    )
    await demo.readonly(false)
    await demo.disabled(true)
    assert.ok(
      clear.disabled &&
        range.querySelector('select').disabled &&
        input('range').disabled,
    )
    await demo.disabled(false)
    clear.click()
    await demo.tick()
    assert.equal(demo.controls.range.field.state.input, null)
    assert.equal(
      range.querySelectorAll('[data-temporal-infinity]').length,
      0,
      'empty is distinct from unrestricted',
    )
    assert.equal(range.querySelectorAll('input[type=date]').length, 2)
    assert.deepEqual(Array.from(demo.errors), [])
    demo.dispose()
    demo = undefined
    assert.equal(
      observers.size,
      0,
      'range observers are disposed with their views',
    )
  } finally {
    demo?.dispose()
    dom.window.close()
  }
})
