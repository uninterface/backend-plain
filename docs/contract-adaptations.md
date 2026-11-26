# Plain contract adaptations

[Documentation index](README.md) · [Presentation and integration](presentation.md)

This backend-owned reference records native mappings, support limits and integration decisions. Shared API semantics remain in @uninterface/uninterface; native component names and concrete appearance do not add business-side parameters. This documentation move adds no runtime support or browser acceptance evidence.
## Fields, controls and strategies

Plain supplies its own reference presentation rather than inheriting a vendor aesthetic. Field size uses its reference scale. Ordinary fields support above/beside, ordinary fieldset groups keep legends above; checkable group titles participate in control-aligned/separated layout, and checkable labels remain beside. Near/far are supported across participating beside labels; general beside resolves to beside-far before rendering; floating generalizes to show. Hidden labels remain accessible. Required annotations default to suffix. Ordinary field help defaults to together; below and tooltip failures are supported, with embedded approximating below. Paginator jumper uses its own default tooltip policy.

UiSelect uses a browser-native select. UiMultiSelect is a bounded native multiple listbox, not a compact popup picker: choices scroll inside a fixed-height rectangle and an inset clear button has its own space. Its height does not grow with candidate count, platform modifier conventions apply and it has no collapsed placeholder. Shared filter adaptations reuse this presentation; they do not add a compact picker.

Segmented selection uses radio labels with the reference border/theme presentation. Borders participate in normal single-row sizing and focus is contained without an extra 3px outer scroll inset. Beside-label alignment uses size-specific text-input first-row padding. Input frames use the reference shared surface. Full-width buttons fill the containment host and control. Control typography is independently sized so muted footer text does not shrink inputs/buttons.

Preview regions use the input surface without a fake editor. Image previews use native images and a contained accessible broken-image glyph. File previews use local scalable family-marked artwork.

Ordinary beside form-label arrangements and separated checkable label/control areas stack below a 40rem viewport. Flushed/control-aligned standalone labels and individual option labels stay adjacent. Checkable labels and group titles remain visible under hidden; see the checkable modes in [strategy support](strategies.md).

## Collections and navigation

Lists/tables use native semantic HTML, colgroups and CSS sticky thead for bounded headers. Sorting controls retain header typography without button chrome and use semantic sort artwork. Priority text participates in width measurement without duplicate announcements. The outer collection host owns scrolling. Arbitrary column filters use themed header buttons and existing popovers; removable criteria use the reference badge surface with a named remove action.

Bounded reference page buttons include directional navigation, with normal input/select tokens for independent size/jumper views. Footer info sits at start, followed by a size → paginator → jumper group at end. Constrained navigation uses bounded windows/named directional symbols; an isolated narrow navigation row centers. This grouping is an Uninterface choice. Native widgets do not fetch data or reconcile deleted pages.

The field-alignment helper supplies a first-row-center callback for the taller multiple listbox. Context menus use shared-equivalent pending-context-event guarding; point menus also constrain the final popup rectangle. Tooltip geometry uses useUiTooltipPosition's viewport-clamped positioning.

## Feedback and surfaces

Notice default is a neutral surface with semantic border; filled uses semantic fill/on-color; outline is transparent with semantic border; soft uses subtle tint. Text-led actions hang their inset into notice space while preserving padded targets.

Floating feedback uses backend-owned notice surfaces and Vue exit lifecycle within a bounded viewport. Toasts use compact inset/inline title, while notifications use the larger notice treatment and separate title. Motion and reduced-motion rules are backend-owned. No countdown indicator is supplied; floating variant requests do not select surface variants.

FooterActions puts the first action at inline-end with reverse-inline flow across modal/drawer/popover/feedback surfaces, preserving DOM/Tab order. Drawers/popovers use reference surfaces and remain arrowless. Owned native top-layer menu popovers preserve modal interaction and use pre-open stacking coordination. Loading regions supply their own indicator/mask. Empty states use reference markup and spanning table body rows.

Tooltips, suggestions and field-failure tooltips register their own positioning roots. A containing native popover supplies the physical host and retains its own registration.

## Temporal, appearance and verification

Supported temporal values use native HTML date/time/datetime-local inputs; explicit presentation preferences, milliseconds and malformed external values use localized text. Boundary-mode selection uses a native select, presenting the specified scalar editor or localized unrestricted content. Shared draft retention, Clear and reset semantics remain unchanged.

Color mode uses data-ui-color-mode and follows system appearance absent an explicit host selector. Default font is Inter Variable. Clear uses Lucide eraser; more-vertical uses ellipsis-vertical; menu-item reuses file with an independent key.

The Plain source checkout includes automated accessibility checks in its [native browser suite](testing.md#run-the-backends-native-tests). Also verify keyboard interaction, accessible names and feedback, focus appearance, geometry and assistive-technology behavior in the application.

See [presentation](presentation.md), [strategy support](strategies.md), [collections](collections.md), [typography](typography.md) and [customization](customization.md).

## Support and native defaults

The following mappings describe this installed adapter. Shared strategy requests can generalize to supported fallbacks; native feature availability alone does not imply adapter support. Three-level control scales map out-of-range requests to the nearest native level. Embedded validation is not implemented and is approximated to below feedback. Browser geometry, wrapping, focus paint and assistive-technology acceptance remain separate from source/DOM checks.

### Native size and field-label support

| Backend | Native editor levels | Native button levels | Supported field labels |
|---|---|---|---|
| Plain | -1/0/1 | -1/0/1 | above/beside-near/beside-far for ordinary fields; above for ordinary fieldset groups; checkable modes include aligned/separated titles and always-visible labels |

### Collapsible color

| Backend | Color behavior |
|---|---|
| Plain | Request ignored; existing presentation retained. |

### Upload allocation

| Backend | Minimum inline size | Minimum block size | Compact / regular / large block size |
| --- | --- | --- | --- |
| Plain | 14rem | 10rem | 10 / 10 / 16rem |

### Upload integration

| Backend | Presentation and concrete adaptation |
|---|---|
| Plain | Reference bordered region, ordinary chooser and native progress; Plain owns its own presentation |

### Notice variants

| Backend | Omitted | filled | outline | soft |
| --- | --- | --- | --- | --- |
| Plain | Neutral surface with semantic border | Semantic fill/on-color | Transparent surface and semantic border | Subtle semantic tint |

### Multiple selection

| Backend | Presentation |
| --- | --- |
| Plain | Native multiple listbox in a fixed-height rectangle; choices scroll internally and an inset clear button has its own space beside them. The rectangle does not grow with the candidate count. |

### Floating feedback integration

| Backend | Implementation |
|---|---|
| Plain | Backend-owned notice surfaces and Vue exit lifecycle in a bounded viewport |

### Default font families

| Backend | Family order |
|---|---|
| Plain | Inter Variable |


## Checkable label and description alignment

Standalone checkboxes and switches use a reference two-column arrangement: the control occupies the first column, with label/help/error text in the second. Label heading margins are removed in this arrangement; the first label line and control share a size-aware row. Radio and checkbox options use nonshrinking controls and first-line alignment, without browser input margins shifting their baselines. Wrapped labels/descriptions remain within the field. This is Plain-owned presentation, not a shared pixel geometry rule.

Business authors supply the existing UiField label/help and business value; no alignment CSS or new public prop is required. Verify short/wrapped labels, descriptions present/absent, requested sizes, narrow/wide fields and both text directions while preserving label activation, keyboard behavior, disabled state and help/error associations. Whole-field flushed/control-aligned/separated arrangements are implemented; see [strategy support](strategies.md) for resolution, alignment and responsive behavior.

Checkable validation recovery focuses the first enabled checkbox or selected enabled/first enabled radio without changing values. Named group/status and form fallbacks get temporary programmatic focusability with blur/disposal cleanup. Native options retain their toolkit indicators and feedback descriptions; fallback containers use the shared backend focus-visible treatment, including forced colors and scrolling containment. Group/field wrappers do not gain standing focusability merely from validation failure.
