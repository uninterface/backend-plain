# Plain presentation and native integration

[Documentation index](README.md) · [Application setup](setup.md)

This reference describes presentation policies, toolkit mappings and integration limits. Application consumers can start with setup; backend maintainers should also review the native coordination and upgrade-sensitive details here.

## Content wrapping in narrow regions

UiContent allows an otherwise unbreakable word to wrap when it exceeds the available line width (`overflow-wrap: break-word`). This includes bare text and inline spans, independently of an enclosing card or paragraph. Ordinary word boundaries remain preferred; explicit descendant whitespace/wrapping rules retain ownership. The adapter supplies this default without author-side CSS, and without changing content insets or resize shares. Bootstrap's native card already provides equivalent inherited wrapping; UiContent also supplies it outside cards.

This is text wrapping, not a measured horizontal resize minimum: a panel narrower than its insets plus a glyph, or non-wrapping/non-text content, still needs an appropriate allocation or scrolling policy. Vertical measured minima remain separate. Verify both supporting regions near horizontal divider limits with enough width for insets and characters, and preserve mounted reading content.

## Native presentation

Plain uses simple native controls and fieldset/legend grouping. Its purpose is usable, straightforward structure with visible focus, without visual ornament. It has no Bootstrap styles or dependency. This light presentation is not a complete high-contrast accessibility certification.

Grouped fields retain native fieldset/legend semantics without a decorative border or inset. Legends use the same typography and label-to-editor spacing as ordinary field labels. Any input surface belongs to the editor, including UiInputFrame; grouping does not add another box around it.

Fields retain help text alongside validation feedback, but allocate no empty feedback row or outer field margin. UiLayout and UiForm own peer separation (1rem); visible help and feedback receive only a 0.25rem leading gap. Label spacing, control dimensions and card/navbar padding remain independent. Errors wrap and expand the field naturally. When leaving a focused field by pointer interaction triggers a new error, its visual feedback waits until the click completes, so the pressed target does not move. During that short deferral the current error remains available to assistive technology and validation proceeds normally. Keyboard blur feedback is immediate. Invalid borders belong to the editor or shared input frame, not the surrounding label/help field wrapper. Focus on an invalid control uses the danger tone as well; forced-colors mode retains the system focus color. This is Plain's presentation policy, not a requirement for other backends.

## Linear layouts

`UiLayout.vue` fulfills `layout.linear.v1`, `layout.division.v1`, `layout.reactive.v1`, `layout.wrap.v1`, `layout.align.v1`, and `layout.scroll.v1`. It consumes resolved options from core, allocates keyed children, preserves them during prop updates, and supplies backend spacing and scroll focus treatment. It works without a provider ancestor and never detects desktop/mobile itself. See **UiLayout** in `@uninterface/uninterface` (`docs/api/components/UiLayout.md`) for exact supported combinations and host-height requirements. Browser geometry verification is required in addition to declarations and DOM tests.

### Avatars

`UiAvatar` supplies `avatar.v1`. An explicit `px` or `em` size sets both
dimensions. Otherwise the avatar follows the scoped control-size strategy.
The adapter uses a native image and a theme-colored fallback surface. Its
neutral diameter is 3.25 times the fallback font size (45.5px with 14px text).
The other steps add or subtract 0.5rem or 1rem from that diameter. Plain's text
and surface tokens also apply in dark mode.

### Layout separators

`UiLayout.vue` supplies `layout.separator.v1` for `UiSeparator`. It paints a
solid 1px line in the existing peer gap using Plain's `--plain-border`. A short
vertical line appears between horizontal peers on the same row. A horizontal
line spans the layout between vertical peers.

## Button color and treatment

`UiButton` consumes all supported theme roles independently of the six button variants (`button.color.v1` and `button.variant.v1`). Without an applicable strategy, omitted color/variant options default independently to secondary/filled. See **UiButton** in `@uninterface/uninterface` (`docs/api/components/UiButton.md`) for the contract.

## Regions, application surface and content

Ordinary UiRegionLayout arrangements compose this UiLayout view into adjoining named start/main/end allocations with `spacing: 'none'`; public UiLayout/UiFlowLayout retain theme-owned peer spacing. Grouped region boundaries also adjoin without extra gaps, and UiContent insets travel with scrolling content; grouped scrolling uses UiRegionLayout.vue; see **UiRegionLayout** in `@uninterface/uninterface` (`docs/api/components/UiRegionLayout.md`).

UiFlowLayout composes this view for content-sized peer items. Cross-axis alignment applies to allocation wrappers; descendant controls retain their sizing contracts. No separate flow view module is required.

`UiApp.vue` fulfills `app.root.v1`: a document-flow application surface inheriting document typography with full available width for content, independent of application context wrappers. It preserves supplied content and landmarks without adding application-role semantics. Optional viewport hosting supplies a bounded height; document remains the default. See **UiApp** in `@uninterface/uninterface` (`docs/api/components/UiApp.md`).

`UiNavbar.vue` fulfills `navbar.v1`: brand, navigation and action slots appear in order and wrap without automatic hiding or collapse controls. It provides navigation semantics and backend-owned presentation independently of UiApp. See **UiNavbar** in `@uninterface/uninterface` (`docs/api/components/UiNavbar.md`).

`UiContent.vue` fulfills `content.inset.v1`: content insets fit within the full offered width, without a width cap, landmark, new surface or provider requirement. Insets coordinate with the navbar's horizontal spacing. See **UiContent** in `@uninterface/uninterface` (`docs/api/components/UiContent.md`).

Viewport UiApp hosting measures its available height (hosting.viewport.v1). UiRegionLayout.vue fulfills layout.region-scroll.v1 for one named vertical group, with retained supporting regions and a keyboard-accessible overflow escape. See **application layouts** in `@uninterface/uninterface` (`docs/guides/application-layouts.md`).

Shared entry views support native single selection with hidden placeholders and disabled candidate options for unloaded/loading/failed/empty source states (without disabling opening or replacing the selected label) and business-owned source recovery controls, inline/popup command menus with host-authored buttonTrigger/contextTrigger bindings, and ordinary navigation lists. Core supplies entries, selection and lifecycle state; this backend owns markup, keyboard focus and popup geometry. Submenus open attached floating surfaces without enlarging the parent; native select uses textual content and one group level. See the **entry contract** in `@uninterface/uninterface` (`docs/contracts/entries.md`) for exact obligations and limitations.

## Theme-color vocabulary

The theme supports the six baseline roles only: primary, success, danger, warning, info and secondary. Accent is unavailable: no definition, capability or style rule is supplied. Requests requiring theme.color.accent.v1 fail capability checks, and dynamically requesting accent fails at runtime. Colors belong to the shared theme vocabulary, not to individual component palettes. See the **theme-color guide** in `@uninterface/uninterface` (`docs/guides/theme-colors.md`).

## Loading presentation

Buttons use native button semantics, a static decorative activity mark rendered only while loading, and an adjacent visually hidden polite status using the localized activity message. Loading exposes busy state and disables activation without changing the action name. The status remains outside the busy element. No animation or reserved indicator space is required.

## Document baseline

The backend stylesheet establishes its default system font and line height on `body`, so ordinary content and popups share typography without a UiApp ancestor. It leaves document margins and native-content structure alone.

Application localization and the icon catalogue are installed through `createUiApplication`; see [setup](setup.md#localization-and-icons). The integration declares matching locale identifiers with empty native resources and supplies the 58-name default subset; UI messages come from core.

Shared grid layout uses this backend’s static `./layout` export (`uiLayoutPresentation`) for peer spacing, also used by its linear layout. Core owns the grid geometry; no separate backend grid component is needed. See **UiGridLayout** in `@uninterface/uninterface` (`docs/api/components/UiGridLayout.md`).


See [strategy support](strategies.md) for optional regional preferences, control-size mappings and unsupported values.


## Shared appearance and text editing

All text modes use the same UiTextInput view: single-line text, masked password, multiline text and readonly editing. Native input and textarea elements own focus and selection. Readonly preserves focus/copy behavior and field participation; disabled remains a separate restriction.

The backend integrates shared light/dark/system setup using `data-ui-color-mode` on the document element. See [setup](setup.md#color-mode). Mode changes retain drafts and open menu sessions. Controller and DOM checks do not establish computed appearance, native picker styling or accessibility conformance; browser checks remain required.

## Button presentation preferences

Plain supplies filled, outline, neutral, softly tinted, text and icon treatments in its own stylesheet. Icon/text content is arranged with theme-relative spacing; icon labels use visually hidden markup.

Icon-only actions grow to fit an explicitly sized icon and keep its space while showing the loading indicator.

All six variants support every declared color. The explicit variant prop takes precedence over an agreed uiButtonVariant regional preference. With neither specified, this adapter ordinarily uses filled; supported application-owned native configuration remains effective. Icon labels stay accessible and supply a native title hint; title display on focus/touch depends on the browser. Pass an explicit title when label content comes from an opaque component. These are support declarations; real-browser geometry and hint behavior need verification. See **UiButton** and **uiButtonVariant** in the core documentation.

## Cards and hierarchy

Cards support an absent header without reserving a blank header band or separator. The optional `top-end` slot anchors concise actions to the card frame using logical edges, independently of preview/media content. Its inset follows half the current card padding, including density changes; the enclosing frame stays positioned and focus remains unclipped. Collection cards use this slot for `card-action-placement="top-end"` and omit headers without selection or meaningful header fields.

UiCard supports five structural requests: -2/-1 higher, 0 ordinary, 1/2 subordinate. Its default map shares the two higher treatments; all other defaults differ. Every level retains a full outline and readable body content. Ordinary/higher levels use solid outlines; both subordinate levels use dashed outlines, independently of color. Higher cards use roomy insets, a band header, large title and raised surface; zero uses normal insets with a band, large title and raised surface; one uses compact insets and a band header; two retains the band and adds a tinted surface and smaller title. Headerless cards retain surface, boundary, density and elevation cues.

Plain uses its own surface/text/border and semantic role tokens. Insets are 1.5rem/1rem/0.625rem for roomy/normal/compact; title sizes are 1.375rem/1.125rem/1rem. The raised treatment uses a foreground-derived shadow. Theme colors use the six Plain role tokens; accent remains unsupported.

All eight portable treatment properties are supported through uiCardPresentation: color, header (band/plain), footer (normal/muted), density (roomy/normal/compact), surface (plain/tinted), elevation (flat/raised), border (solid/dashed/dotted/double) and titleSize (large/normal/small). A map can independently customize all five levels, including -2 and -1. Exact native values remain theme-owned; solid/dashed is a primary distinction in Uninterface’s default hierarchy; applications can override patterns, including double, through their presentation maps. This is an Uninterface convention, not a claim of a universal toolkit hierarchy.

UiCard.color overrides the level's color; null explicitly selects neutral and omission uses the profile. Colored boundaries and softly tinted header/body regions use the effective role, while body text retains ordinary foreground. Neutral uses the theme's ordinary boundary tone. Private tokens reset on every card, so a parent's explicit color does not color nested cards or controls. Shared profile scope still independently applies to each participating card. Title/description slots receive structured typography; arbitrary header content retains its own typography and replaces both slots.

The card grows with content, has no sticky regions or scrollport, and preserves descendants when level, color or profile changes. Parent layouts own peer spacing; card regions own insets. No heading rank or interaction role is inferred. See [customization](customization.md) for setup and stylesheet ordering. Structural tests do not establish visual hierarchy quality; compare representative nested content in both modes and at narrow widths.

Default headers at levels 1/2 retain full insets and a separator so the footer does not receive the only region boundary. Ordinary title typography is semibold, with footer decoration intended to be equal or quieter. Native footer decoration is retained. Application-owned themes, custom plain-header profiles and rich footer content require assessment of the complete pairing; the default styling cannot control the prominence of arbitrary business content.

Plain sets a card-local separator style on existing header/footer borders; every card resets its default to solid before applying its own request. Pattern changes never add a separator to a plain header, reveal a missing footer, or change nested-card requests.

Footer emphasis defaults to muted at levels 1/2 and normal elsewhere. Muted uses --plain-muted with 0.875rem text. Plain input/select/button text owns a rem-based control scale so footer typography does not reduce control labels. Normal retains the native/reference foreground and body text scale. No whole-region opacity or control-size strategy is applied. Both subordinate levels use the same small scale. Card roots reset typography to the backend body baseline to prevent a nested card from inheriting reduced footer type. Backgrounds, insets and separators retain their independent policies. These scoped text changes fulfill the explicit portable footer request; native HTML/third-party content retains normal CSS inheritance responsibilities. Verify custom content and theme legibility in both modes.


### Context-menu host focus

UiMenu supplies `buttonTrigger` for explicit button activation and `contextTrigger` for contextual interaction on a content group. Apply the complete binding with `v-bind`. The contextual binding includes a private backend class that gives its element a visible keyboard-focus boundary; it does not change child control styling. Focus colors follow this backend's theme, with a system-color outline in forced-colors mode. The boundary uses a backend default radius independent of nested content; it does not infer a child card's shape. Ordinary consumers need no backend class names or focus CSS.


### Reusable focus presentation

Use `useUiFocusPresentation()` from `@uninterface/uninterface` and apply its complete object with `v-bind` to an author-supplied focus target. This backend fulfills `focus.presentation.v1` through its static `./focus` module and stylesheet. The same theme treatment used by context-menu content is available on native links and suitable custom regions anywhere in the application. The binding supplies no tabindex, roles or interaction; callers retain those responsibilities. Branding applies it explicitly rather than relying on navbar ancestry. Avoid adding a second focus treatment to existing toolkit/Uninterface controls. Theme and forced-colors behavior follow the contextual focus treatment described above.

### Region framing

Ordinary UiRegionLayout supports optional separators, selectable adjacent numeric-share resize boundaries and relative sibling layers. Plain uses its border/surface tokens and reference shadow. Separators occupy one theme-owned track; resizers replace that track with a pointer/touch target and use this backend's reusable focus treatment. The initial target is 0.5rem across the split; themes may customize the private layout handle/separator size properties. Raised surfaces do not add content insets.

The adapter owns markup/geometry and uses the optional useUiLayoutResizeView helper for measured pointer interaction, RTL-aware keys and cleanup. Core owns the adjusted ratio and validates relationships. This is allocation framing, not a card or a claim of a native splitter widget. Rendering stays stable while framing changes; the reading scrollport cannot clip a sibling header's shadow. Local layering does not establish global overlay order. Forced-colors uses system boundary colors. Shared browser acceptance remains necessary for hit targets, focus and geometry.

Region separation belongs to UiRegionLayout and spans the full allocation boundary, independent of navbar/UiContent size. A designated navigation child suppresses its matching local edge even when the layout explicitly hides ordinary separators. Standalone and unrelated nested navigation retain their own borders.

Start–Main uses `--plain-text`; Main–End uses `--plain-border`. These line colors express stronger/quieter emphasis in both equal-depth and raised cases. They never change elevation, shadow opacity/reach or stacking order. This is the adapter's region-framing policy, not a claim that native toolkit navbars independently implement these region roles. Application theme overrides should preserve the distinction and both lines' visibility.

Raised region presentation decorates shared edges toward lower neighbours. The adapter retains the foreground-derived `0 3px 10px` shadow on a separate shadow plane: reflect vertically for a before/top edge, rotate for inline edges, and mirror logical mapping in RTL. Absolute decoration uses `container-type: size` and `cqw`/`cqh` units to keep the rotated plane's footprint equal to the allocation; this requires a browser supporting size container queries. Business content is neither size-contained nor clipped. The wrapper clips only edge decoration. Native shadow customization still feeds the plane, with the same recipe at both roles. No exposed outside edge gains a border.

Equal-depth boundaries retain requested ordinary separators, including all-raised and none-raised states. A raised edge replaces the ordinary separator. Resize handles retain their own tracks and boundary lines; the adjoining raised decoration omits its extra line and stays below the interactive handle. Forced-colors uses a system-color line and suppresses shadows; tone and depth distinctions may collapse. Verify short content, both axes, RTL, light/dark themes and custom theme values in a real browser.

## Button announcement containment

The native button and its persistent loading-announcement live region share a private positioned inline-flex host. The clipped announcement is anchored at the host origin so a button inside a long scrollport does not extend document overflow. Attributes, events, form association and focus still target the native button. The live region remains outside its accessible name and mounted while idle.

## Input-styled controls

The core **Input-styled controls** contract (`docs/contracts/input-styled-controls.md` in the core documentation) defines this shared look-and-feel agreement. Applicable text, scalar temporal, select and compact multiselect surfaces normally fill their field-control allocation, align to its logical start, use a coherent input frame with visible focus, and default to one row. Textarea and wrapping selections are explicit adaptations. Field labels and feedback retain their existing arrangement strategies. Native theme tokens and supported customization supply the appearance; business compositions do not compensate with CSS.

UiInputFrame composes sub-inputs and supporting content into one input-styled control. UiTextInput shares its frame without adding another border. Existing native controls can fulfill the same agreement directly. Temporal ranges share one frame with unframed endpoint editors. UiFileInput is input-styled: chooser, accepted filename and clear action share the surface. UiUploadRegion retains its drop-area presentation and owns the internal arrangement of optional progress, preview and actions. UiFileInput keeps previews separate. See the [reviewed components](reviewed-components.md) for ownership and native adaptations. This documents obligations, not new visual acceptance evidence.

Plain's current bounded native UiMultiSelect listbox remains a documented different presentation; it is not claimed as a compact input-styled picker.

## Shared input frames

Framed text editors support `maxWidthCharacters` as an approximate character-cell display cap (`input.frame.sizing.v1`), applied to the real editor allocation while the inner input fills it. It never supplies maxlength or changes parsing. UiInputFrameSpacer receives remaining logical inline space through an automatic start margin after editor growth; it is decorative and has no tab stop. The price example uses eleven cells for ten digits plus a decimal separator and places the spacer after USD. Narrow-width/RTL geometry remains subject to browser verification.

Plain input frames reuse the ordinary plain-input surface: square corners, the same padding and small/normal/large dimensions, and matching border, invalid border and focus outline treatments. The frame adds only inward flex arrangement. Immediate UiButton actions fit its content row and inherit its type scale; nested independent controls retain their own sizing. Parts share the frame focus outline, and disabled temporal participants do not dim a second time inside a disabled frame. File inputs and temporal ranges reuse this surface as well.

UiInputFrame with ordinary UiTextInput implement input.frame.v1 and input.frame.cooperation.v1; single-line search also declares input.text.search.v1. The frame consumes field invalid/busy/disabled state and existing failure/size strategies. Hidden failure presentation retains aria-invalid. Parts receive unique names/IDs and the owning field's visible feedback descriptions. Leading, default and trailing content share one wrapping surface. Readonly leaves text selectable and blocks in-frame buttons by default; allowWhenReadonly permits appropriate non-editing actions without bypassing disabled/loading. Owned popup engagement is coordinated; popup content has a separate field/surface scope.

Use the [customization guide](customization.md) for consumed configuration. Functional DOM acceptance covers focus movement, invalid-part focus, incomplete drafts, Save/Reset/Clear and restrictions. Check appearance and narrow geometry with the intended theme in a browser; DOM tests are not visual evidence.

The adapter composes the native file chooser and accepted filename within its backend input frame; Clear participates in the same surface. Filename text follows the accepted descriptor independently of the browser file list. Acquisition alone creates no preview object URL. Browser visual acceptance remains separate from functional DOM checks.

Native date/time editors remove additional vertical padding from both browser edit wrappers (`::-webkit-datetime-edit` and `::-webkit-datetime-edit-fields-wrapper`) inside the Plain input surface. The surface owns the inset and the editor retains its minimum row size. Range mode acceptance compares native endpoint rows with unrestricted placeholders at desktop/mobile widths in light/dark mode without relaxing state-size tolerances.

Temporal ranges observe their own allocated host width without CSS size containment. This avoids the container boundary where Chromium browser diagnostics showed persistent zero-sized descendants after invalid data replaced a native endpoint editor. The private layout mapping retains the existing date/time/date-time thresholds of 28/24/40 root-font units; it observes local allocation rather than selecting an application viewport profile. Resizing changes layout without remounting editors or changing drafts, and observers are disposed with the view. Endpoint wrappers use flex alignment so unrestricted badges do not introduce inline-baseline space. Verify visible invalid fallback, focus recovery and retained partial drafts at narrow and wide allocations. DOM tests separately check resize mapping, editor identity and observer lifetime.

## Vertical navbar adaptation

UiNavbar follows core's resolved navigation-region orientation. In a side navigation allocation it stacks brand, links and actions vertically at every width; a top/bottom or standalone navbar retains horizontal wrapping. Theme spacing and child semantics remain native to this backend. Only the acknowledged logical edge is rendered; a region-owned edge is not duplicated. This implements the shared UiNavbar backend guidance in `@uninterface/uninterface` (`docs/api/backend/navigation.md#uinavbar-implementation-guidance`), rather than relying on incidental narrow-width wrapping.


### Context menus during window resizing

The adapter uses core's backend helper `useUiMenuPoint` to retain the original click coordinates and derive an effective point constrained to the current document viewport. Shrinking past the original click recalculates the anchor; expanding restores it where possible. Plain keeps its existing resize handler and final-popup-rectangle clamp in addition to the shared point constraint. Button and keyboard invocation keep their element anchors. Resize preserves menu identity, open state and focus; shared point observers disconnect on deactivation/unmount. This addresses ordinary window resizing; it does not claim separate pinch-zoom or virtual-keyboard acceptance. Verify root and nested menus across shrink/expand and ensure commands remain reachable. Automated DOM tests cover state/wiring; browser geometry remains a separate acceptance check.


## Compound-control baseline alignment

The backend declares `layout.baseline.v1` for horizontal UiLayout/UiFlowLayout rows, with and without wrapping. The existing native CSS Grid/Flexbox allocation consumes `align="baseline"`; keyed allocation and stacking wrappers stay in place. Each wrapped row aligns independently. Vertical baseline alignment and UiRegionLayout baseline requests fail in core.

Input-frame editor participants supply the first editable baseline, ahead of leading icons and trailing actions. Native minimum-height surplus is centered around the content line. Button hosts use baseline vertical alignment; visible captions participate in baseline export while decorations retain their centered treatment. Field/form wrappers propagate the reference naturally; above labels expose their first line, while hidden/floating labels expose editable content. These adaptations preserve native typography, padding and control ownership. Arbitrary opaque content retains native baseline/fallback behavior; no DOM search or measured offset selects its business target.

Scalar text surfaces use a wrapping flex formatting context so `align-content: center` distributes minimum-height surplus around the editable row even while that editor exports its baseline. This keeps text centered with read-only table values and action icons without changing the baseline reference. Leading/trailing parts retain their ordinary centered placement and can wrap when space is insufficient.

The table's private cell-content part middle-aligns a direct button host in its inline content line, avoiding surplus baseline space above the action in standards mode. An authored UiLayout/UiFlowLayout inside a cell retains its own alignment contract; the rule only coordinates a direct action. Verify with `<!doctype html>`, actual content geometry, hover and differing fonts.

The Shared input frame keyword row and Collections OrderSearch row exercise this behavior. Source/DOM checks do not establish painted text alignment; browser acceptance must compare actual text baselines at supported sizes, RTL, wrapping, feedback and loading states.


Framed UiTextInput also supports `minWidthCharacters` (`input.frame.min-width.v1`). The real editor allocation consumes a minimum in font-relative `ch` units; the inner native input continues to fill it. This minimum takes precedence over shrinking/percentage maxima in an insufficient host and is never a minlength constraint. Omission preserves the existing compact minimum and maximum-width behavior. OrderSearch and the Shared input frame keyword example request 20 cells; this is a business-composition choice, not a backend-wide search width.

## Neutral buttons

Uses the existing reference button geometry with neutral text/border/surface tokens at rest. Hover, focus-visible and active use the requested semantic text/border and a 10% theme-color tint. Disabled buttons retain their neutral surface and existing opacity.

Select variant="neutral" independently of color. This fulfills the neutral-rest/semantic-interaction contract using backend-owned adaptations; it does not change omitted defaults. Test color changes, variant removal, loading/disabled behavior, keyboard focus, and light/dark themes. DOM mapping coverage does not establish browser visual acceptance.


See [Contract adaptations](contract-adaptations.md) for this backend’s native mappings, support limits, allocation defaults and verification qualifications.

## Infinite table continuation

The adapter places continuation in its native tbody, spanning the declared and selection columns. Loading, append failure/Retry and completion scroll with the data, before any creation row and summary. The sentinel stays at that point. The adapter retains one announcement outside the table/loading mask; non-infinite and card status paths remain separate. Verify pending/retry/completion, bounded infinite and no-summary tables, plus switching to manual content-height accumulation, preserving keyed editor state and column alignment.

## Infinite continuation content

UiTable, UiList and collection card views forward `infinity-loading` and `infinity-complete` message-content slots with `{ message, loadedCount }`. The backend retains its loading indicator, status container, continuation position and independent sentinel; table continuation remains before creation/summary rows. Initial/refresh masks and non-infinite status paths retain their existing presentation. Missing/empty content uses the resolved default text. Core resolves per-view `messages.listAppending`/`listComplete` for visible defaults and the elected announcement. Error slots expose `placement` for initial, replacement and append recovery. See the `@uninterface/uninterface` Collection views guide, Infinite continuation content section for ownership and observable checks.

Default infinite loading/completion feedback is centered and subordinate to record text. Plain uses its muted foreground token and a smaller relative text size. The local loading message inherits that size instead of enlarging with control-size strategies; the backend retains its indicator. Errors, empty states and non-infinite feedback keep their own treatment. Custom infinity content inherits the status tone/alignment.

## Progress bars

Standalone and upload-hosted bars share `UiProgressBar.vue` and `progress.bar.v1`. Both measured and unknown progress use horizontal bars. See the [shared progress guide](progress.md) for this backend’s native mapping, precise range, semantic color and reduced-motion adaptations. The producer retains operation and announcement ownership.
