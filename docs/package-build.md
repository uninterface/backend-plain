# Build the Plain package

From the Plain repository root with Node.js 24 and npm:

```sh
npm ci
npm run build
npm pack ./dist/package
```

The build writes compiled ES modules, Vue-aware declarations, styles, capability metadata and documentation to `dist/package`. Each public `.vue` subpath resolves to its own JavaScript entry and declaration. The build preserves per-component CSS imports and shares Vue and Core with the application through peer dependencies.

The [publish workflow](../.github/workflows/publish.yml) checks the packed export targets and installs the tarball under `@uninterface/backend` in a fresh Vue/Vite consumer to verify type checking and the production build. Use the [application setup guide](setup.md) to try the package in your own app.

## Release from a Git tag

Commit the intended version in `package.json` and `package-lock.json`. Tag that commit as `v<version>` and push the tag. For example, `v0.0.2` requires `package.json` version `0.0.2`.

The publish workflow verifies the tag against the committed version, runs the package and consumer checks, and publishes the verified tarball to the npm `alpha` dist-tag. The npm trusted publisher for `publish.yml` and the GitHub `npm` environment must allow `npm publish`. A manual run can build an artifact or stage it for npm approval.
