import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

const entry = new URL('./fixtures/presentation.ts', import.meta.url)

test('collapsible uses native presentation and indicator', async () => {
  await withBuiltDomFixture(build, entry, async (fixture) => {
    const example = await fixture.mountExpandedCollapsible()
    try {
      const root = example.host.querySelector('[data-fixture="collapsible"]')
      assert.ok(root)
      assert.equal(root.tagName, 'DETAILS')
      assert.equal(root.open, true)
      assert.ok(
        root.querySelector(':scope > summary.plain-collapsible-trigger'),
      )
      assert.deepEqual(Array.from(example.errors), [])
    } finally {
      example.dispose()
    }
  })
})
