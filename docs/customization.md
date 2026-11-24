# Plain presentation and customization

[Documentation index](README.md) · [Application setup](setup.md)

Plain supplies a deliberately simple reference presentation with native controls.
It has no upstream theme builder, configuration factory or supported general
palette/density token interface. Import its stylesheet as described in setup.

## What can be customized

Application-owned branding and native HTML content may have their own styles.
The shared application setup also supports semantic icon catalogue overrides;
see [localization and icons](setup.md#localization-and-icons). Neither mechanism
is a complete Plain theme.

Plain's CSS contains concrete colors, dimensions and private component selectors.
Although CSS can technically override them, those selectors and incidental
variables are not a stable public customization API. There is currently no
supported one-file full-theme import. Shared color-mode setup selects the built-in
light/dark palettes; that does not expose a general palette authoring API.
Do not infer support from the ability to override a button's computed color.

For a substantially different presentation, choose a backend with the required
customization support, or implement a backend fulfilling the public contracts.
A theme authoring interface for Plain would require documented tokens and coverage
of controls, states, layouts and popup surfaces before being advertised.

Plain's backend acceptance includes the strict automated WCAG AA scan. Changing
its presentation can affect that result; its reference results do not certify an
application's custom CSS or content.

## Verify a customized presentation

Check the same business components with and without your customization: filled
and outline buttons, disabled/loading states, field help/errors, select and menu
popups, icons, layout wrapping and scrolling. Confirm visible keyboard focus and
readable text. Check both supported color modes, including an already-open popup.
Do not infer whole-application coverage from a single button or claim WCAG
conformance from a theme's name. Customization must preserve Uninterface's model,
validation, selection and interaction contracts.

Keep theme authoring in application setup and styles; business views should not
need native toolkit props or per-component CSS to activate the theme. An existing
color role can be recolored without changing its meaning. Adding a role requires
backend implementation and capability support across all relevant components;
CSS alone does not extend Uninterface's theme vocabulary.

## Portable card hierarchy customization

For changes that should survive switching backends, configure a shared strategy in an application-owned Vue composition; no additional stylesheet is required:

```vue
<script setup lang="ts">
import { UiStrategy, uiCardPresentation } from '@uninterface/uninterface'
const cards = uiCardPresentation({
  [-2]: { color: 'primary', border: 'double' },
  [-1]: { color: 'primary', elevation: 'flat' },
  1: { header: 'band', density: 'compact' },
  2: { color: 'secondary', surface: 'tinted' },
})
</script>
<template><UiStrategy :use="cards"><slot /></UiStrategy></template>
```

Place the application's cards under this composition. Omitted properties retain the shared defaults. Each UiCard can override its effective role with color, or explicitly request neutral with :color="null". Customizing palette values remains an application theme task using the setup above; raw CSS/native variant names do not belong in this map. The same configuration works across conforming adapters, with each retaining its own concrete theme values. [Presentation mappings](presentation.md#cards-and-hierarchy) specify which native values are consumed. Test nested/peer cards, headerless units, both color modes and narrow layouts before adopting a custom profile.

## Default font delivery

Import a selected font.css or font-bundled.css entry first, then the stable backend style.css. Omit font imports for system or application-owned fonts, using --uninterface-font-family for a complete override. See [typography](typography.md) for all four choices, setup steps, CSP sources, licenses and limits.

The ordinary font setup offers four choices: backend or Uninterface default, each with Network or Bundled delivery. Import one font entry before the stable backend stylesheet, following [typography](typography.md); the Uninterface choices require the optional `@uninterface/fonts` package.

## Shared input frame coverage

Plain owns a flex surface using its border, surface, text and focus tokens. Parts inherit typography and share the frame focus outline. Small/normal/large use the same typography scale as ordinary text inputs.

The frame follows the input theme through the supported setup described above; private adapter selectors are not a stable public styling API. Check ordinary inputs beside the compound frame under the chosen light/dark theme, sizes, focus, invalid, disabled and readonly states. Interior part wrapping is adapter-owned and is not a global layout-spacing customization contract. See [presentation mappings](presentation.md#shared-input-frames) for limits.


## Drawers and popovers

UiDrawer (modal and retained panel modes) and UiPopover consume this backend's normal surface, typography and color-mode setup. The adapter renders native-themed content over browser dialog/manual-popover hosting so Uninterface remains the only lifecycle and stacking owner. Application styles load after backend style.css; preserve hidden/inert behavior, bounded scrolling, focus treatment and core-owned stacking when customizing. Popups are teleported to body or the owning overlay; scope application theme variables accordingly. Toolkit gesture/snap-point/resizing options and docked/compact drawer allocation are not exposed. Layout peer spacing remains owned by the existing layout components.
