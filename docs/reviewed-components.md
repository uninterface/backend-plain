# Component presentation

Plain uses native checkbox/switch and file controls, browser date/time inputs, and its own tooltip/suggestions presentation.

Password reveal preserves the editor and uses a named non-submit reveal action. Switches follow the shared switch-then-label arrangement. Search source/selection and temporal validation remain core-owned. Tooltips and suggestions use popup targets inside their owning modal. Directly owned tooltips paint below the header and footer. A managed tooltip requires at least half of its anchor area visible after clipping and overlap by known layout regions. File chooser/drop accepts one file; uploads use an application transport. Preview URLs are resolved and released by core.

Ordinary temporal editors use HTML `input[type=date]`, `input[type=time]` and `input[type=datetime-local]` directly. The browser owns the indicator, native picker, locale/order and dismissal behavior. There is no intermediate Plain popup or duplicate calendar button. Alt+ArrowDown calls `showPicker()` synchronously where available; platforms without that API retain their native input interaction. Browser-owned picker UI cannot be registered as a library DOM dialog, teleported or assigned an adapter-controlled open state.

Text fallbacks retain explicitly requested locale/hour-cycle presentation, millisecond precision and externally supplied values that HTML would sanitize away. These cases edit inline as text without a second picker/input popup. Native inputs cannot guarantee a fixed visible date order or honor an arbitrary requested locale/hour cycle or expose arbitrary raw partial text. Ordinary native edits report canonical values directly; core still owns timezone projection, eligibility and validation. Unavailable native selections remain visible as invalid drafts instead of being silently reverted.

For an unfinished native edit, `validity.badInput` distinguishes partial input from a genuine empty value. Since the platform does not expose the entered segments, the adapter projects an invalid incomplete draft (`____-__-__`, `__:__`, or `____-__-__T__:__`) to core. This prevents optional fields from accepting partial input as null. Ordinary rerenders and validation do not assign the native value again, so the browser keeps its visible segments. Reset and external value changes deliberately replace the native draft. If the editor is unmounted or switched to text presentation, only the incomplete marker is recoverable, not the browser-private segment contents. This is a documented native-platform limitation, not lossless raw-text support. Text fallback drafts remain fully owned by core.

Use the existing application-owned [customization guide](customization.md) for theme setup and stylesheet ordering. These components consume the same native theme configuration; no extra business stylesheet or generic styling wrapper is required. Keep overrides after the backend stylesheet and test teleported popup coverage in light/dark modes. Do not style only the component wrapper when the actual editor or popup lives elsewhere.

Shared control and built-DOM checks exercise state, naming, calendar/time/datetime selection, text fallback preservation of milliseconds and invalid text, native incomplete/empty distinction, reset and disabled/readonly behavior, file replacement and tooltip associations. Check picker geometry, touch and keyboard behavior, hover continuity, modal stacking and assistive technology in the intended environment.

Breadcrumbs retain the Plain reference ordered trail and link presentation. The backend renders each link/text target directly, forwarding core navigation guards and attributes. Current and disabled items have no destination.

Temporal ranges compose both endpoints, separator and supporting actions inside the backend UiInputFrame view. Endpoint editors retain their own editing behavior and share one surface; at narrow allocations they stack inside that frame while retaining the separator and endpoint order. Native editors keep room for their browser-provided segments and indicators; spare allocation follows the range before Clear. Focus within a native input or inline action keeps the shared frame engaged; browser picker focus follows native behavior. A leading native select shows a compact Unicode mode symbol and caret while retaining full localized option labels, platform keyboard/menu behavior and visible focus. It offers only allowed combinations: both specified, start only, end only, unrestricted. Mode changes retain drafts; external synchronization/reset and Clear discard them. Both endpoint positions remain visible in every mode; an unrestricted endpoint is a compact ∞ badge, so fully unrestricted reads ∞ – ∞; unrestricted is distinct from an absent whole value. The compact × action clears the whole range. Overnight time ranges use the shared custom calendar +1 SVG with localized accessible text and a tooltip. These actions obey disabled/readonly state; an empty draft never implicitly opens a boundary.

Plain text/password editors put the unframed text target and reveal action inside one reference input surface. Ordinary temporal editors keep the browser-native input and indicator inside that surface. Integrated boundary and File Clear actions inherit the input font and fit its content row.

UiUploadRegion uses a workflow binding with retained-field or service destinations. Optional progress, preview and actions are arranged entirely by this backend. Plain owns the reference border, chooser button and native progress presentation. The complete named region receives drops and fits its contents within an explicit extent without scrolling; optional contents no longer reserve blank rows. Upload/association locks persist when progress or preview is absent. Focus moves to an available chooser/action or the region when a focused action disappears. Preview URL lifetime remains core-owned; controller lifetime belongs to the business composition.

The upload group is excluded from ordinary Tab traversal (tabindex=-1 while enabled); Tab visits the chooser/actions directly. Named fallback focus remains available when no action accepts focus. Ordinary Plain chooser/action indicators are retained.

The disabled upload boundary uses the same 0.65 opacity as the shared input frame and a not-allowed cursor. Enabled region focus uses the shared input's 3px focus token and containment-aware offset. Shared input-frame wrappers also lose their focus target when disabled; live disabling releases internal surface focus, and upload recovery cannot focus a disabled region.

Verify appearance and geometry in the browser, including zoom and RTL.

### Concise upload states

The region shows its chooser/artwork only in the ready state. Working and retained states display file/progress or file/preview with available actions. Recovery uses one short error and a row of actions. Progress labels remain accessible without a duplicate visible caption; preview displays the filename once. Embedded previews use a compact file summary. Ordinary demo uploads succeed; deliberate failure is available in the separate Upload failure simulation and test fixtures.

This backend's compact/regular/large allocations are currently 10/10/16rem. There is no shared minimum. The allocation remains stable across states; the host must respect the backend minimum size; content never introduces scrolling. These are adapter defaults, not business-authored dimensions or browser geometry acceptance.

### Image-only preview

UiImagePreview uses the container allocation or explicit dimensions, with contain by default and stretch when requested. It has no border, avatar shape, filename, caption or actions. Missing/failed content uses an accessible broken-image glyph, without visible failure prose. A parent with definite bounds retains its rectangle through failure; auto sizing cannot reserve unknown intrinsic dimensions before loading. Embedded upload previews use their region's available bounds instead of a fixed thumbnail limit. File metadata presentation remains separate.

Native img supplies object-fit; fallback is adapted SVG. DOM checks pass separately from browser geometry/visual acceptance.


Upload regions declare minimum inline/block allocations and do not scroll internally. Long file/error text is abbreviated with full DOM text and title retained; recovery keeps its actions visible. This backend declares a minimum inline size of 14rem and block size of 10rem; hosts, including fill allocations, must respect those constraints. Browser acceptance of fitting is separate from DOM workflow checks.


### Upload minimum-size audit

Fill uses the same interior padding/gap as compact so a Tile fits at the declared minimum. Delivery failures use the same single error line and recovery-action arrangement as acquisition failures, avoiding an extra filename row.

In a browser, check compact, regular, large and fill allocations at the minimum and at narrow widths. Repeat at each supported control size with known, unknown and hidden progress, long file names and errors, delivery retry, portrait and landscape previews, and no preview. Verify that visible descendants stay within the allocated region and that actions remain reachable.



### Transfer failure and retry presentation

UiUploadProgress presents both active transfer progress/Cancel and transfer failure/Cancel/Retry. Failed transfers have concise feedback and available native Cancel and Retry buttons, without a progress indicator. The file name is visible inside the progress/recovery presentation and identifies the transfer group; Retry describes its failure. The view invokes guarded producer callbacks and never creates a task. The backend retains its existing button and progress primitives and arranges feedback/actions within the allocated width.

UiUploadRegion composes the same progress view for transfer recovery, without duplicating the filename, error or Retry. Acquisition rejection and delivery failure remain region-owned. Omitting the progress indicator does not omit essential transfer feedback or selected Retry; cancellation is not an error, but an owner may retain a Retry action. Recovery layout responds to recovery participation, including cancellation without an error message. Keyboard context is preserved across standalone Retry/Cancel changes; region focus coordination includes the chooser. DOM checks cover wiring and lifetime; browser fitting and assistive-technology checks remain separate.

The Files demo's Supporting functions section contains Previews beside the independent Upload progress and Upload failure cards; the two top cards align, and no extra Upload simulation heading is rendered. Both use UiUploadProgress; the failure case has no chooser, region frame or playback controls. Each retry deliberately fails again for presentation review.

### Explicit control language boundaries

A control with its own `lang` uses the font family selected at that language boundary. Ordinary control font resets continue to inherit typography; the explicit boundary no longer loses its CJK fallback selection through `font: inherit`. Browser font loading and language-profile checks remain required.

Progress and transfer failure share a filename row above a context/action area. Failure uses the native danger/error foreground. Standalone messages wrap completely, including unbroken text; actions stay at logical end and wrap below if necessary. Inside UiUploadRegion, the concise summary retains full DOM text/title and Retry association. The chooser shares the identity row while the complete lower allocation is available to feedback/actions. Native action labels keep their ordinary dimensions.


The stable minimum block allocation is 10rem. Compact and regular use 10rem and large uses 16rem. This budget accommodates the file identity, error and native recovery actions at the minimum width, including a wrapped action row. Long diagnostics may require more space. Ordinary workflow states share the same allocation.


Transfer-failure text uses `--plain-danger`, with color and mode mapping owned by the theme. The optional shared focus helper retains keyboard context across the brief activity-to-failure rendering gap, including an immediately repeated failed Retry. Verify focus after a failure and an immediate failed retry.
