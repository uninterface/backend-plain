# Set up the Plain backend

This guide owns the application integration requirements for `@uninterface/backend-plain`. Business components use `@uninterface/uninterface`; toolkit configuration stays at application assembly.

## Requirements

Use Node.js 24 or 26, Vue compatible with core's `^3.5.18` peer dependency, TypeScript with `"moduleResolution": "Bundler"`, and Vite with `@vitejs/plugin-vue`. Run `vue-tsc` for Vue-aware type checking. Keep one runtime copy of Vue and core.

## Select Plain

Plain ships compiled ES modules and TypeScript declarations. To select Plain in an existing Vue/Vite application, install it under the `@uninterface/backend` alias.

```sh
npm install @uninterface/uninterface @uninterface/backend@npm:@uninterface/backend-plain
```

Choose a Core version that satisfies the selected backend release's peer dependency.

For source development, see the [package build](package-build.md) and [native test instructions](testing.md#run-the-backends-native-tests). Install this checkout's development dependencies with `npm ci`.

## Configure Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

## Initialize the application

```ts
// src/main.ts
import { createUiApplication } from '@uninterface/uninterface/setup'
import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import App from './App.vue'

const app = createUiApplication(App, { document })
await app.ui.ready
app.mount('#app')
```

No backend Vite plugin is needed. The required `./integration` export is a descriptor consumed automatically by createUiApplication, not a Vue plugin to install directly. The backend supplies its own minimal stylesheet and native controls; it has no underlying UI toolkit dependency.

The integration descriptor is loaded by core through the selected alias; business components need no backend imports. Import the stylesheet once. The top-level `document` option grants ownership of document language attributes; omit it for an embedded application. Await readiness before mounting. For SSR/hydration, supply the same explicit `idPrefix` on both sides, create a fresh application per request and call `app.ui.dispose()` in `finally`. The core application-isolation guide defines the verified editing baseline and request-owned business-session cleanup.

Create a minimal `App.vue` to verify the configured application:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UiApp, UiButton, UiContent } from '@uninterface/uninterface'

const acknowledged = ref(false)
</script>

<template>
  <UiApp>
    <UiContent>
      <h1>Application ready</h1>
      <UiButton
        :disabled="acknowledged"
        @click="acknowledged = true"
      >
        Acknowledge
      </UiButton>
      <p v-if="acknowledged" role="status">Acknowledged.</p>
    </UiContent>
  </UiApp>
</template>
```

Mount into the existing Vue application's `#app` element. Use its configured Vite and Vue type-check commands to build/check the source. Confirm that the button responds, becomes disabled and displays the status. This verifies a basic interaction, not every backend capability or browser.

## Scope and verification

The [presentation reference](presentation.md) documents native mappings and limitations; [exports](exports.md) documents assembly modules. Capability declarations describe supported contracts; they do not certify accessibility. Browser keyboard, focus, popup, contrast and scrolling checks remain necessary in addition to builds and DOM simulation.

## Localization and icons

Use `createUiApplication` to install core resources and this backend’s icon catalogue. Core’s application-localization service owns language selection. This backend has no separate native translation pack: its locale declarations use empty native resources, and its UI messages come from core.

Core supplies English, Simplified Chinese, Traditional Chinese and Arabic. The integration declares matching locale identifiers and aliases; `app.ui.i18n.state.value.resolved.backend` reports that resolution even though no native message pack is needed. Additional languages require complete core resources; full RTL requires acceptance beyond translated messages.

The catalogue supplies 58 semantic icon names. Application overrides affect UiIcon and menu entry icons; native internal glyphs retain their toolkit defaults. Assets are bundled locally without an external icon service. The backend uses a bounded Lucide subset; see [Lucide license](icon-licenses/Lucide.txt).

Arabic (`ar`, العربية) uses script-derived RTL direction. No native message pack is needed; Arabic library wording comes from core. `resolved.backend` reports `ar`, including for compatible regional requests. Message and direction support do not certify full RTL layout or browser acceptance.

Request a language through the installed service; do not install another native locale manager:

```ts
await app.ui.i18n.setLocale('zh-Hans')
```

Register your own headings, field labels and business messages through `i18n.resources` at createUiApplication setup. Core packs translate library-owned text, not arbitrary strings in your application. Resource failures retain the previous language; handle the rejected request. Additional catalogue definitions use the setup `icons` option. Exact resource and icon contracts are documented by `@uninterface/uninterface` under `docs/guides/localization-and-icons.md`.

## Color mode

This backend declares `theme.color-mode.v1`. Configure `createUiApplication(App, { colorMode: { document } })` to own the document's appearance; optional `preference` selects light, dark or system and optional `storageKey` enables persistence. Omit ownership in embedded apps to inherit the host. The native document selector is `data-ui-color-mode="light"` or `data-ui-color-mode="dark"`; without a host selector, ordinary appearance follows the system. Do not install a competing preference controller. SSR must emit the selector matching the initial resolved mode before hydration. Both ordinary content and popups must receive the same theme.

## Customize presentation

See [customization](customization.md) for supported application-owned styling,
native configuration possibilities and adapter limitations.

See [strategy support](strategies.md) for optional regional preferences, control-size mappings and unsupported values.

## Typography: fonts first, backend styles second

| Choice | First import: fonts |
|---|---|
| **Backend default · Network** (recommended starting setup) | `@uninterface/backend/font.css` |
| **Backend default · Bundled** | `@uninterface/backend/font-bundled.css` |
| **Uninterface default · Network** | `@uninterface/fonts/font.css` |
| **Uninterface default · Bundled** | `@uninterface/fonts/font-bundled.css` |

Import one selected font entry before the stable `@uninterface/backend/style.css`, as shown in the setup example. The Uninterface choices require the optional `@uninterface/fonts` package. Omitting the font import uses system fonts without downloads. See [typography and fonts](typography.md) for installation, CSP, deployment, language coverage and verification steps.

[Native HTML content defaults](native-html.md): supported element baseline, toolkit mappings, setup, spacing and verification limits.


### Common icon assets

The common catalogue supplies 58 semantic names with independent override keys. The artwork includes Lucide icons from `@iconify-json/lucide` 1.2.144. Setup imports the catalogue as local Vue components. Applications should budget for the whole catalogue in the bundle. Native internal glyphs are separate from the override catalogue. For semantic names and overrides, see `docs/api/constants/uiIconNames.md` and `docs/guides/localization-and-icons.md` in the Core package. See [asset sources and mappings](icon-licenses/SOURCES.md).
