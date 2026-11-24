# Common icon asset provenance

The mappings below use selected artwork from Lucide from `@iconify-json/lucide` 1.2.144 in local Vue templates. The license texts in this directory apply to the distributed artwork.

`create` reuses the plus component. Each semantic name remains independently overridable. `first` and `last` use directional metadata. Sort artwork retains its direction.

| Meaning | Artwork |
| --- | --- |
| `create` | `plus` |
| `remove` | `minus` |
| `reset` | `rotate-ccw` |
| `clear` | `eraser` |
| `retry` | `rotate-cw` |
| `home` | `house` |
| `help` | `circle-help` |
| `bookmark` | `bookmark` |
| `location` | `map-pin` |
| `globe` | `globe` |
| `calendar` | `calendar` |
| `time` | `clock` |
| `file` | `file` |
| `image` | `image` |
| `attachment` | `paperclip` |
| `email` | `mail` |
| `filter` | `list-filter` |
| `sort` | `arrow-up-down` |
| `sort-ascending` | `arrow-up-narrow-wide` |
| `sort-descending` | `arrow-down-wide-narrow` |
| `first` | `chevrons-left` |
| `last` | `chevrons-right` |
| `external-link` | `external-link` |

Follow-up common `link` uses `link` from the same collection/version listed above. It depicts chain links, distinct from the outward-arrow `external-link` artwork. Existing asset licenses apply.

## Native-first common mappings

`menu-item` reuses Lucide `file`, the same component as `file`, with an independent override key. `more-vertical` uses the native `ellipsis-vertical` glyph from the collection/version above, without rotation.

For new mappings, inspect the supported icon set first and retain suitable native artwork. Transform it only when the required variant is absent; draw new artwork only when the set cannot express the meaning. Record the source/version, license and reason for each transformation or custom asset. See `@uninterface/uninterface` documentation at `docs/contracts/icon.md#backend-artwork-selection`.

Common `settings` uses `settings` from the pinned collection/version above. Existing gear/cog artwork is preserved without rotation or redrawing; the existing asset license applies.

The `clear` mapping uses the unmodified `eraser` from the pinned collection in a local Vue component. The source license applies. Toolkit-owned input clear glyphs use their own presentation.

The `move-up` and `move-down` semantic names reuse the existing `arrow-up` and `arrow-down` shafted arrow artwork respectively, with independent override keys and no RTL mirroring. No additional artwork is bundled for these aliases.

The four physical direction icons, `arrow-up`, `arrow-down`, `arrow-left` and `arrow-right`, use the unmodified `arrow-up`, `arrow-down`, `arrow-left` and `arrow-right` artwork from the pinned collection/version above. Existing licenses apply. These arrows have shafts and retain their physical direction in RTL; they are distinct from navigation chevrons and logical previous/next actions.
