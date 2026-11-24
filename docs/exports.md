# Plain package exports

[Documentation index](README.md)

The application installs `@uninterface/backend-plain` under `@uninterface/backend`. The paths below use that alias so application and test configuration agree. Business views use `@uninterface/uninterface`.

| Module | Export and responsibility |
|---|---|
| `@uninterface/backend` | `uiBackend`: adapter identity/version, toolkit versions, theme definitions and capabilities; ordinary business code reads these through core's getUiRuntime() |
| `@uninterface/backend/capabilities.json` | Machine-readable support manifest; [view declarations](../capabilities.json) |
| `@uninterface/backend/font.css` | Backend default · Network: recommended family selection and pinned CDN font delivery; import before style.css |
| `@uninterface/backend/font-bundled.css` | Backend default · Bundled: identical family selection with local assets; import before style.css |
| `@uninterface/backend/style.css` | Stable document/component styling and native font mapping; import after the chosen font entry, or alone for system fonts |
| `@uninterface/backend/integration` | Default UiBackendIntegration descriptor consumed by createUiApplication; native resources/icons and a per-app create function, not itself a Vue plugin |
| `@uninterface/backend/layout` | `uiLayoutPresentation`: backend peer spacing consumed by shared core layouts |
| `@uninterface/backend/UiXxx.vue` | Individual backend Vue views, statically imported by core; not business-facing components |
| `@uninterface/backend/testing` | `uiTestAdapter`: select/checkbox interactions and field presentation mappings for the separate Playwright harness; test setup only |

## View modules and compatibility

View modules include UiApp, UiContent, UiNavbar, UiForm, UiField, UiTextInput, UiCheckbox, UiRadioGroup, UiCheckboxGroup, UiSelect, UiMenu, UiNavMenu, UiButton, UiLayout, UiRegionLayout and UiIcon. The `.vue` subpaths resolve to individual compiled ES modules and TypeScript declarations. UiFlowLayout and ordinary region composition reuse the linear view; UiGridLayout geometry belongs to core and consumes the backend's spacing export.

The canonical signatures, slots, events and focus handles are defined by `@uninterface/uninterface/backend` and core's `docs/api/backend/README.md`. Use a Core version supported by Plain's `peerDependencies`. This package's [presentation reference](presentation.md) describes how native integration fulfills the contracts.

Capabilities declare support but do not certify behavior. Unsupported requirements fail core's checks. Tooling and applications must exercise the relevant contracts before claiming browser compatibility.

`./UiCard.vue` supplies the content-height card view (resolved level and header/default/footer slots), with `card.v1` and `strategy.hierarchy-level.v1`.

`@uninterface/backend/focus` exports immutable `uiFocusPresentation` for core’s `useUiFocusPresentation()` and backend-owned interaction bindings. It supplies presentation only and declares `focus.presentation.v1`; business authors import the function from core.
