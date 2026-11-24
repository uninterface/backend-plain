import { test } from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { readFile } from 'node:fs/promises'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

const entry = new URL('./fixtures/feedback-presentation.ts', import.meta.url)
test('Plain feedback supplies an actual appearing transition and coherent notice surface', async () => {
  const css = await readFile(
    new URL('../src/style.css', import.meta.url),
    'utf8',
  )
  const view = await readFile(
    new URL('../src/FeedbackItem.vue', import.meta.url),
    'utf8',
  )
  // Match direct focus against the native CSS rule. Paint is verified in the browser.
  const focusRule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(
    ([, selector, declarations]) =>
      selector.includes(':has(') &&
      selector.includes('feedback') &&
      /outline:/.test(declarations),
  )
  assert.ok(focusRule)
  const focusedSurface = focusRule[1]
    .trim()
    .replaceAll(':focus-visible', ':focus')
  assert.match(css, /feedback-viewport\s*\{[^}]*padding: 1rem;/s)

  await withBuiltDomFixture(build, entry, async ({ mountFeedback }, window) => {
    for (const kind of ['toast', 'notification']) {
      const example = await mountFeedback({ duration: null }, kind)
      try {
        const handle = example.send(`${kind} native surface`, true)
        await delay(150)
        const item = window.document.getElementById(handle.id)
        assert.ok(item)
        const content = item.querySelector('.plain-feedback-content')
        assert.ok(content)
        assert.equal(content.getAttribute('role'), 'region')
        const surface = content.closest('.plain-feedback-item')
        assert.ok(surface)
        function verifyCue(target, expected) {
          assert.ok(target)
          target.focus()
          assert.equal(window.document.activeElement, target)
          assert.equal(surface.matches(focusedSurface), expected)
        }
        verifyCue(content, true)
        verifyCue(content.querySelector('input'), false)
        verifyCue(item.querySelector('button[aria-label="Close"]'), false)
        verifyCue(item.querySelector('[data-ui-footer-actions] button'), false)
        verifyCue(content, true)
        content.blur()
        assert.equal(surface.matches(focusedSurface), false)

        assert.ok(item.classList.contains('plain-notice'))
        assert.ok(item.querySelector('.plain-notice-close svg'))
        assert.ok(
          item.querySelector(
            kind === 'toast' ? '.plain-toast-title' : '.plain-notice-title',
          ),
        )
        assert.match(view, /<Transition[\s\S]*?\bappear\b/)
        assert.match(
          css,
          /\.plain-feedback-enter-active,[\s\S]*?transition:\s+opacity/,
        )
        assert.match(
          css,
          /prefers-reduced-motion: reduce[\s\S]*?plain-feedback-leave-active[\s\S]*?transition: none/,
        )
        assert.deepEqual(Array.from(example.state.errors), [])
      } finally {
        example.dispose()
      }
    }
  })
})
