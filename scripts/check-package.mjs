import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
)
const [pack] = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const files = new Set(pack.files.map(({ path }) => path))

assert.equal(pack.name, manifest.name)
assert.equal(pack.version, manifest.version)
assert.equal(manifest.private, undefined)
assert.match(
  manifest.dependencies['@uninterface/uninterface'],
  /^\d+\.\d+\.\d+$/,
)
for (const version of Object.values({
  ...manifest.dependencies,
  ...manifest.devDependencies,
})) {
  assert.doesNotMatch(version, /^(workspace|file|link):/)
}

for (const target of Object.values(manifest.exports)) {
  const path = target.slice(2)
  const [prefix, suffix] = path.split('*')
  const included =
    suffix === undefined
      ? files.has(path)
      : [...files].some(
          (file) => file.startsWith(prefix) && file.endsWith(suffix),
        )
  assert.ok(included, `Missing export target ${target}`)
}

for (const file of [
  'LICENSE',
  'README.md',
  'package.json',
  'docs/setup.md',
  'docs/icon-licenses/Lucide.txt',
  'docs/font-licenses/inter.txt',
  'docs/font-licenses/noto-sans-sc.txt',
  'docs/font-licenses/noto-sans-tc.txt',
]) {
  assert.ok(files.has(file), `Missing package file ${file}`)
}

console.log(`${pack.name}@${pack.version}: checked ${files.size} packed files`)
