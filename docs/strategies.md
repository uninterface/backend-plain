# Presentation strategies

For application authors choosing optional presentation preferences with this backend. Use `UiStrategy` and the common factories from `@uninterface/uninterface`; no backend imports or CSS are needed in business components. Core's strategy contract and usage guide define attachment, custom queries, scope and blocking.

```vue
<UiStrategy :use="uiControlSize(-1)">
  <UiField :field="name" label="Name"><UiTextInput /></UiField>
  <UiButton>Continue</UiButton>
</UiStrategy>
```

Import the components and `uiControlSize` from `@uninterface/uninterface`, and create `name` with `createUiFieldControl('')`. Apply strategies to an existing region; UiStrategy adds no DOM wrapper.

## Control size

| Controls | Native levels and mapping |
|---|---|
| UiTextInput, UiSelect, UiCheckbox | -1 / 0 / 1 → smaller / ordinary / larger |
| UiButton | -1 / 0 / 1 → smaller / ordinary / larger |

Text, select and button dimensions change through backend-owned classes; checkbox artwork uses 1.25 / 1.5 / 1.75rem. Field labels, helper text and feedback also follow the field scale. Each field sizes only its own presentation parts, so nested fields and blocked editors do not receive a second inherited size multiplier. Exact dimensions remain theme-owned.

Zero requests ordinary size. Levels are ordinal, not multipliers or additive offsets. All five size requests participate in agreement; the adapter maps the agreed level to its native scale. A three-level scale maps -2/-1 to small, 0 to ordinary and 1/2 to large. Common queries require supported contributions to agree; conflicting values preserve ordinary presentation. Omit strategies for normal use.

## Field presentation

Five common field queries participate, with per-field label support:

| Factory | Values and effect |
|---|---|
| uiCheckablePresentation | adapt / flushed / control-aligned / separated; checkable labels and group titles stay visible |
| uiFieldLabels | show / above / beside / beside-far / beside-near / floating / hidden; unsupported detail generalizes to beside/show |
| uiRequiredAnnotations | prefix / suffix / yes / no; presentation without changing required semantics |
| uiFieldHelp | together / replace-help; replace help only while a visible error is displayed |
| uiValidationFailure | none / show / show-below / show-embedded / show-tooltip; select failure visibility and placement |

Plain owns its reference field layout: ordinary fields support above and both beside alignments; non-checkable native fieldset groups support above/hidden. General beside resolves to beside-far before rendering. All participating ordinary labels, separated checkable labels and aligned/separated group titles honor explicit near/far consistently. Required annotations use localized text; helpers ordinarily coexist with errors.

Show uses ordinary below-field feedback. Show-below is supported; show-embedded renders below. Show-tooltip uses the same positioned presenter as the page jumper. It requests an anchored error bubble automatically while an issue is present. It appears when at least 50% of the editor anchor is visible after clipping and overlap by known layout regions. The accessible error description persists while the bubble is hidden. In a popover that stacks above its owning modal’s header and footer, the error appears below the field inside the popover. Tooltip feedback does not contribute to the editor’s layout width. Embedded means the error message itself inside the control surface; this backend does not currently implement it. None suppresses field messages while retaining native invalid-state styling and preserving aria-invalid, requiredness, validation and submission behavior. Hidden message description IDs are removed, and help is restored. Form submission summaries remain independent.

All common requests agree before native fulfillment. Unsupported label detail generalizes through beside/show; failure placement generalizes to show. Show enables default visible treatment without imposing a location; omission preserves backend defaults. Core recommendations are not automatically applied declarations. Conflicting supported requests retain ordinary presentation. Reactive changes preserve editor identity, draft and focus. Required annotations yes uses this backend’s default suffix placement; optional annotations remain deferred.

Floating labels generalize to show. Hidden keeps labels and legends accessibly associated while visually hiding them.

Resolution follows agreement on original intent. Before rendering, general show/yes/beside/adapt values, omitted preferences and unsupported detail become concrete supported treatments. Equivalent resolved presentations share native integration and geometry; renderers do not implement a separate backend-default path. Required annotations resolve to prefix/suffix/no and failure messages to a supported visible mode or none. Reactive native configuration is read during resolution.

Omitted strategies add no presentation preference. Defaults belong to this backend and its supported application configuration, rather than a fixed common strategy value.

## Verification

Check every documented level against the ordinary control, then remove the declaration and verify recovery. Change preferences while editing: drafts, control identity and focus must survive. Block `uiControlSizeQuery` in a nested UiStrategy and verify that inherited sizing stops while other concerns remain. Real-browser checks are needed for dimensions, visible focus and responsive arrangements; simulated DOM checks alone do not establish those properties.

[Documentation index](README.md) · [Presentation](presentation.md)

## Hierarchy

uiHierarchyLevel applies to card nodes. Explicit UiCard.level overrides the regional answer; disagreement/no answer uses zero. Agreement compares all five original requests before the permitted -2 to -1 adaptation. Targets, depth, stopAt and family/query blocking remain effective. See [card presentation](presentation.md#cards-and-hierarchy) for native mappings.

## Card presentation

uiCardPresentation configures all five level treatments independently of uiHierarchyLevel. All shared options are fulfilled; see [cards and hierarchy](presentation.md#cards-and-hierarchy). Partial maps retain core-selected defaults. Whole-profile semantic unanimity governs overlapping declarations; disagreement/no answer or blocking restores the default map. Family/query barriers and target/depth/stopAt scopes apply without native CSS-context leakage. Explicit card color overrides the map for that card; null selects neutral. Changing a profile does not remount content or alter child control sizes.

## Layout density

UiLayout, UiFlowLayout and UiGridLayout support `uiLayoutDensity(-1 | 0 | 1)` for peer separation. -1 maps to `0.5rem`; 0 preserves `1rem`; 1 maps to `1.5rem`. These are backend fulfillment values, not business-author inputs. Zero/no answer uses the original default; supported conflicting answers retain that default. Both grid axes use the selected spacing. Native tokens/classes remain application-theme controlled where used.

Density does not resize controls, change typography or content padding, or separate UiRegionLayout allocations. Nested layouts honor logical targets, depth, stopAt and query barriers without inherited CSS density. See `@uninterface/uninterface` documentation at `docs/guides/layout-density.md`. Shared DOM tests verify all levels, restoration, scoped barriers and retained input state/focus; browser geometry is a separate acceptance check.

### Checkable-control labels

UiCheckbox and UiSwitch use the checkable presentation strategy: adapt by default, or explicit flushed/control-aligned/separated. Adapt first resolves effective ordinary label placement, including reactive native defaults, general values and unsupported requests. It then selects control-aligned for effective beside placement or flushed otherwise. Explicit modes select their own arrangement independently of ordinary placement support. All standalone labels and group titles remain visible under hidden. Radio/checkbox option labels remain adjacent; control-aligned/separated group headings occupy the label area. Separated standalone labels use the outer field label and preserve native input association. Layout columns stack below 40rem; standalone labels stay adjacent in flushed/control-aligned modes. In control-aligned mode, field descriptions and below-control feedback begin at the control area/check control, rather than the adjacent label; adapt uses this rule whenever it resolves to control-aligned, including narrow stacking. Flushed standalone descriptions retain label-text alignment. Size, markers and values retain their own behavior.

This implements the shared checkable-control presentation modes. Verify all label modes and restoration, required markers, value/focus retention and label activation; browser checks must also cover narrow/wide widths, wrapping and RTL. DOM integration checks alone do not establish visual geometry.


## Button width

uiButtonWidth supports content/full for standalone text-labelled buttons. Full stretches both the containing host and actionable surface to the parent allocation; content retains intrinsic width. Icon-only and parent-input-frame actions keep their geometry. Omission/conflicting answers preserve defaults. Native sizing, focus, disabled/loading and action behavior remain unchanged. The core strategy guide documents scope and barriers.

## Docked drawer motion

Docked drawers retain their resolved extent while the docking grid track opens or closes. The surface uses the existing backend drawer motion; allocation motion uses the same timing. Exit keeps the surface mounted and visible until motion settles, with interaction disabled. Reduced motion disables both transitions. Resizing uses immediate geometry rather than repeatedly animating the allocation. Popups retain their existing overlay hosting. Verify repeated opening, Close/Escape, focus return, retained content, all edges and responsive panel/docked changes separately from human visual acceptance.
