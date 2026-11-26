import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { buildFixture } from '@uninterface/testing/fixture-build'

await import('@uninterface/backend/testing')
await import('@uninterface/backend/testing/dom')

const entry = new URL('fixture.mjs', import.meta.url)
await writeFile(
  entry,
  `
export { mountCollectionFixture } from '@uninterface/testing/fixtures/collection'
export { mountFileInputFixture } from '@uninterface/testing/fixtures/file-input'
export { mountReferenceFixture } from '@uninterface/testing/fixtures/reference'
`,
)
const result = await buildFixture(
  {
    logLevel: 'error',
    build: {
      write: false,
      lib: { entry: fileURLToPath(entry), formats: ['es'] },
    },
  },
  {
    resolveBackend: (subpath) =>
      import.meta.resolve(
        subpath ? `@uninterface/backend/${subpath}` : '@uninterface/backend',
      ),
  },
)
const output = (Array.isArray(result) ? result : [result]).flatMap(
  (bundle) => bundle.output,
)
assert.ok(
  output.some(
    (file) => file.type === 'asset' && file.fileName.endsWith('.css'),
  ),
  'Compiled fixtures retain their CSS',
)
