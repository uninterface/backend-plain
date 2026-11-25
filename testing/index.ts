import {
  uiNativeTestAdapter,
  type UiTestAdapter,
} from '@uninterface/testing/playwright'

import {
  cardParts,
  fieldGroupParts,
  fieldSelectors,
} from './presentation-parts.mjs'
import { presentationParts } from './browser-presentation-parts'

export const uiTestAdapter: UiTestAdapter = {
  ...presentationParts,
  card: (card) => cardParts((selector) => card.locator(selector)),
  ...uiNativeTestAdapter,
  fieldGroup(group) {
    const parts = fieldGroupParts((selector) => group.locator(selector))
    const { label } = parts
    const generated = label
    return {
      ...parts,
      required: {
        elements: label.locator(fieldSelectors.required),
        before: generated,
        after: generated,
      },
    }
  },
  inputFrame: (frame) => ({ surface: frame }),
  buttonFocus: (button) => ({ target: button, kind: 'outline' }),
  menuPopup(menu) {
    return menu.locator(
      'xpath=parent::*[@popover="manual" and contains(concat(" ", normalize-space(@class), " "), " plain-entry-popup ")]',
    )
  },
  modal(dialog) {
    return {
      body: dialog.locator(':scope > .plain-modal-surface > .plain-modal-body'),
      actions: dialog.locator(
        ':scope > .plain-modal-surface > .plain-modal-footer',
      ),
    }
  },
  columnHeaderParts(header) {
    return {
      caption: header.locator(
        '.plain-table-sort, .plain-table-header:not(:has(.plain-table-sort))',
      ),
      sortTarget: header.locator('.plain-table-sort'),
      sortIndicator: header.locator('.plain-table-sort-icon'),
    }
  },
  popoverSurface(dialog) {
    return dialog.locator(
      ':scope[data-ui-overlay="popover"] > .plain-modal-surface',
    )
  },
  async field(control) {
    const parts = await uiNativeTestAdapter.field!(control)
    const segments = control.locator('.plain-segments')
    const text = control.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " plain-text-surface ") and not(@data-ui-frame-editor)][1]',
    )
    const surface = segments.or(text)
    return {
      ...parts,
      surface: (await surface.count()) ? surface : parts.surface,
      required: {
        ...parts.required,
        elements: parts.label.locator('.plain-required'),
      },
    }
  },
}

export { browserControlParts } from './browser-control-parts'
