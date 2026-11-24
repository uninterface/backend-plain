# Uninterface Plain backend

Minimal Vue presentation for Uninterface, using native controls and straightforward, accessible structure without decorative styling. Business components import `@uninterface/uninterface`; this package supplies presentation while core owns values, validation, submission, entry sources and selection.

## Start here

Follow [application setup](docs/setup.md) for prerequisites, the backend alias, styles and required integration. Use [the documentation index](docs/README.md) for native mappings, exports and testing.

## Presentation defaults

Native text, checkbox and select controls provide the editing surface. Help remains visible alongside errors. Fields reserve one line for validation feedback; longer messages expand. Buttons default to secondary/filled. The six baseline theme colors are supported; accent is unavailable.

Layouts preserve Uninterface's space allocation and scrolling rules. Navbar content wraps rather than silently collapsing. Source loading remains core-owned; the backend displays progress, unavailable candidates and errors using its native presentation where available.

## Document styles and theme

The stylesheet sets a system font and line height on body. It leaves document margins and ordinary HTML structure alone. These effects apply to the document, including ordinary HTML and teleported content, rather than relying on a UiApp styling boundary.

Supports shared light/dark/system integration through application setup, including host inheritance and popup surfaces. Application initialization supplies localized core messages and the semantic icon catalogue. This backend needs no separate native message pack. See [language and icons](docs/setup.md#localization-and-icons).

For application-owned theme settings, supported recipes and current limits, see
[customization](docs/customization.md).

See [presentation strategies](docs/strategies.md) for size levels, native mappings and optional field-preference support.

## Limits and compatibility

The [capability manifest](capabilities.json) records declared support. A declaration is not evidence of browser compatibility. Minimal styling and visible focus do not establish complete accessibility conformance.

Use [presentation and integration](docs/presentation.md) for concrete native mappings, global style effects and limitations. [Testing](docs/testing.md) explains consumer harness setup and the boundary around backend-owned acceptance suites. Runtime backend switching and negotiation beyond synchronous strategy query agreements are not supplied.

See [modal presentation](docs/modals.md) for the dialog surface, owned popup integration and verification limits.

- [Selection, feedback and panels](docs/selection-feedback-panels.md)

See [typography and font delivery](docs/typography.md) for four explicit setups: backend or Uninterface defaults, each with Network or Bundled delivery; includes language coverage and application-owned alternatives.

[Native HTML content defaults](docs/native-html.md): supported element baseline, toolkit mappings, setup, spacing and verification limits.

- [Component presentation](docs/reviewed-components.md) — native integrations and current acceptance limits.

- [Navigation menu presentations](docs/navigation.md)

- [Collection presentation](docs/collections.md) — implemented list/table/paginator mappings and acceptance limits.

Table columns support preferred/minimum widths, spring allocation, pointer/keyboard boundary resizing and left/center/right alignment. See the [backend sizing notes](docs/table-columns.md) for defaults, native integration, insufficient-space behavior and verification limits.

Loading surfaces: Plain supplies its own indicator and mask. UiCard, UiTable, UiList and UiCollectionView integrate blocking loading while preserving mounted content. The core library’s loading guide documents surface ownership and verification.

- [Segmented selection](docs/segmented-selection.md) — joined, visible single-choice fields.

UiDrawer and UiPopover now have backend views for modal runs, retained nonblocking drawer panels and anchored interactive content. See the core drawer/popover guide and this backend's customization documentation. Browser geometry and interaction acceptance remain separate from rendered DOM checks.


See [Contract adaptations](docs/contract-adaptations.md) for this backend’s native mappings, support limits, allocation defaults and verification qualifications.

- [Floating launchers, docking and resizing](docs/floating-panels.md): native integration, customization and verification limits.

## License

Uninterface source is available under the [MIT License](LICENSE).
