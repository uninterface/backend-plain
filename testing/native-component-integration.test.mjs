import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

test('Plain controls own their styling without a provider or application ancestor', () => {
  const css = readFileSync(
    new URL('../src/style.css', import.meta.url),
    'utf8',
  ).replace(
    "@import './native-content.css';",
    readFileSync(new URL('../src/native-content.css', import.meta.url), 'utf8'),
  )
  // jsdom does not resolve custom properties in border shorthands. Materialize
  // the declared default palette so this test exercises selector ownership.
  const palette = new Map(
    [
      ...css
        .match(/:root\s*\{([^}]*)\}/)[1]
        .matchAll(/(--[\w-]+):\s*([^;]+);/g),
    ].map(([, name, value]) => [name, value]),
  )
  const resolved = css.replace(
    /var\((--plain-[\w-]+)\)/g,
    (original, name) => palette.get(name) ?? original,
  )
  const dom = new JSDOM(`<!doctype html><style>${resolved}</style><body>
    <input class="plain-input plain-invalid" disabled aria-invalid="true">
    <fieldset class="plain-field plain-invalid" aria-invalid="true"><legend class="plain-label">Group</legend></fieldset>
    <div class="plain-app">
      <input id="native" disabled aria-invalid="true">
      <fieldset id="native-group"><legend>Native group</legend></fieldset>
      <button id="native-button" disabled>Native action</button>
    </div>
  </body>`)
  try {
    const { document, getComputedStyle } = dom.window
    const control = getComputedStyle(document.querySelector('.plain-input'))
    assert.equal(control.display, 'block')
    assert.equal(control.boxSizing, 'border-box')
    assert.equal(control.opacity, '0.65')
    assert.equal(control.borderTopWidth, '2px')
    const group = getComputedStyle(document.querySelector('.plain-field'))
    // Plain's documented fieldset is semantic grouping; the editor owns its frame.
    assert.equal(group.borderTopWidth, '0px')
    assert.equal(group.minInlineSize, '0')

    // Native content keeps its own non-inherited defaults inside UiApp.
    const properties = [
      'opacity',
      'cursor',
      'borderTopWidth',
      'boxSizing',
      'paddingTop',
    ]
    const native = ['#native', '#native-group', '#native-button'].map(
      (selector) => document.querySelector(selector),
    )
    const before = native.map((node) => {
      const style = getComputedStyle(node)
      return properties.map((property) => style[property])
    })
    document.querySelector('style').remove()
    for (const [index, node] of native.entries()) {
      const style = getComputedStyle(node)
      assert.deepEqual(
        properties.map((property) => style[property]),
        before[index],
      )
    }
  } finally {
    dom.window.close()
  }
})

test('native button variants and indicators follow the declared treatments', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/buttons.ts', import.meta.url),
    async ({ mountButton }) => {
      const treatment = (value) => `plain-variant-${value}`
      const strategies = await mountButton({}, { strategy: 'text', icon: true })
      const strategyButton = strategies.host.querySelector('button')
      try {
        assert.ok(strategyButton.classList.contains(treatment('text')))
        await strategies.update({ variant: 'outline' })
        assert.ok(strategyButton.classList.contains(treatment('outline')))
        await strategies.update({ variant: undefined })
        await strategies.updateContent({ strategy: 'soft' })
        assert.ok(strategyButton.classList.contains(treatment('soft')))
      } finally {
        strategies.dispose()
      }
      const example = await mountButton()
      const button = example.host.querySelector('button')
      try {
        for (const color of [
          'primary',
          'success',
          'danger',
          'warning',
          'info',
          'secondary',
        ]) {
          for (const variant of [
            'filled',
            'outline',
            'neutral',
            'soft',
            'text',
          ]) {
            await example.update({ color, variant })
            assert.ok(button.classList.contains(`plain-color-${color}`))
            assert.ok(button.classList.contains(treatment(variant)))
          }
        }
        await example.update({ color: undefined, variant: undefined })
        assert.ok(button.classList.contains('plain-color-secondary'))
        assert.ok(button.classList.contains(treatment('filled')))
        const indicator = () => button.querySelector('.plain-button-indicator')
        assert.equal(indicator(), null)
        await example.update({ loading: true })
        assert.ok(indicator())
        await example.update({ loading: false })
        assert.equal(indicator(), null)
        assert.ok(
          !readFileSync(
            new URL('../src/style.css', import.meta.url),
            'utf8',
          ).includes('.plain-color-accent'),
        )
      } finally {
        example.dispose()
      }
    },
  ))

test('layout density uses the native spacing at each strategy scope', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/layout-density.ts', import.meta.url),
    async ({ mountDensity }) => {
      const expected = ['0.5rem', '1rem', '1.5rem']
      const example = await mountDensity()
      try {
        const root = (name) =>
          example.host.querySelector(`[data-density=${name}]`)
        const spacing = (name, level) => {
          const element = root(name)
          assert.ok(element, name)
          assert.equal(element.style.gap, expected[level + 1], name)
        }

        for (const level of [-1, 1, 0, -1]) {
          await example.update([level])
          for (const name of ['linear', 'flow', 'grid', 'parent', 'nested'])
            spacing(name, level)
          spacing('blocked', 0)
          spacing('reset', 0)
          assert.equal(root('regions').style.gap, '0')
        }
        await example.update([-1, 1])
        for (const name of ['linear', 'flow', 'grid', 'nested'])
          spacing(name, 0)
        await example.update([-1], { depth: 1 })
        for (const name of ['linear', 'flow', 'grid', 'parent'])
          spacing(name, -1)
        spacing('nested', 0)
        await example.update([1], { targets: ['grid-layout'] })
        spacing('grid', 1)
        spacing('linear', 0)
        spacing('flow', 0)
        await example.update([-1], { stopAt: ['layout'] })
        spacing('linear', 0)
        spacing('nested', 0)
        spacing('grid', -1)
        await example.update([])
        for (const name of ['linear', 'flow', 'grid', 'nested'])
          spacing(name, 0)
      } finally {
        example.dispose()
      }
    },
  ))

test('collection footer slots follow the native DOM order', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/collection-footer.ts', import.meta.url),
    async ({ mountCollectionFooter }) => {
      const example = await mountCollectionFooter()
      try {
        const parts = [
          ...example.host.querySelectorAll('#order-footer [data-part]'),
        ]
        assert.deepEqual(
          parts.map((part) => part.dataset.part),
          ['info', 'size', 'paginator', 'jumper'],
        )
      } finally {
        example.dispose()
      }
    },
  ))

test('table cell alignment uses physical direction after RTL changes', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/table-sizing.ts', import.meta.url),
    async ({ mountSizing }, window) => {
      Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
        get: () => 800,
      })
      const example = await mountSizing()
      try {
        const cells = () => [
          ...example.host.querySelectorAll(
            'table[aria-label="Sized table"] tbody td',
          ),
        ]
        const matches = (cell, align) => cell.style.textAlign === align
        assert.ok(matches(cells()[1], 'right'))
        assert.ok(matches(cells()[2], 'center'))
        example.host.setAttribute('dir', 'rtl')
        example.align.value = 'left'
        await example.flush()
        assert.ok(matches(cells()[1], 'left'))
      } finally {
        example.dispose()
      }
    },
  ))
