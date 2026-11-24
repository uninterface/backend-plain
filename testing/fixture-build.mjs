import { buildFixture } from '@uninterface/testing/fixture-build'

const backend = {
  resolveBackend: (subpath) =>
    import.meta.resolve(
      subpath
        ? '@uninterface/backend-plain/' + subpath
        : '@uninterface/backend-plain',
    ),
}

export const build = (options) => buildFixture(options, backend)
