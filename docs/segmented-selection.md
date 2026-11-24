# Segmented selection

UiSegmentedSelect uses native radio labels with the Plain reference theme. Core supplies a UiChoiceGroupViewProps binding and owns field updates, validation, source state and retained values. The backend owns actual markup, focus and theme presentation.

The public component requires an ordinary UiField without group and an owner-supplied entry control. Horizontal is the default, vertical is optional. The strip scrolls locally when labels exceed the available width; it does not open a popup or truncate the choice set. Standard field feedback and size strategies remain supported. Native defaults and application theme configuration supply visual values; no business CSS is required.

Radio semantics preserve undefined/no selection and empty-string keys, skip disabled choices during arrow navigation, and retain the selected value when activated again. Local size strategies use native size APIs and preserve query barriers. Light/dark appearance follows the backend theme.

Automated DOM regressions cover selection, codec integration, keyboard events, feedback and focus. Actual browser scrolling, visible focus, RTL geometry and assistive-technology acceptance remain separate checks.

The strip fills its allocation using flexible segments with intrinsic label minima. The existing outer border and separators remain, along with the primary selected fill.

## Field alignment

Follow the core field alignment discipline (`@uninterface/uninterface` documentation: `docs/guides/field-alignment.md`). Navbar field peers anchor at block-start, so tall editors and feedback grow downward. The segmented scrollport has no outer padding; focus is contained inside the items while preserving theme colors and local scrolling. Segment minimum heights account for the shared outer border and use the ordinary small/default/large input height rhythm. Verify focused scrolling and geometry in the browser.


## Ordinary field label integration

UiSegmentedSelect is one composite editor inside an ordinary UiField, not a grouped field. Remove `group` from consumers; explicit group is rejected. The backend still owns its internal named radiogroup and individual option names, requiredness, feedback associations and keyboard behavior. Overall label placement follows ordinary field strategies, retaining this backend's existing adaptations. Hidden preserves the accessible name. Activating an external field label focuses the selected enabled option, then the first available option or named fallback, without selecting a value; disabled state blocks focus. Native integrated labels retain their existing interaction. This distinction also applies to settings-container responsive strategies.
