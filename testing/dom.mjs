import {
  cardParts,
  fieldGroupParts,
  fieldSelectors,
  entryIconColumn,
  temporalPickerParts,
} from './presentation-parts.mjs'
import {
  uiNativeDomTestAdapter,
  domFieldParts,
  domFieldFeedbackParts,
} from '@uninterface/testing/dom'

const emptyState = (scope) => {
  const elements = scope.querySelectorAll('.plain-empty')
  if (elements.length > 1)
    throw new Error('More than one empty state in the supplied scope.')
  return elements[0] ?? null
}

export const uiDomTestAdapter = {
  ...uiNativeDomTestAdapter,
  card: (card) => cardParts((selector) => card.querySelector(selector)),
  field: (editor) => domFieldParts(editor, fieldSelectors),
  fieldGroup: (group) =>
    fieldGroupParts((selector) => group.querySelector(selector)),
  fieldFeedback: (editor) => domFieldFeedbackParts(editor, fieldSelectors),
  emptyState,
  temporalPicker: (picker) =>
    temporalPickerParts((selector) => picker.querySelector(selector)),
  menuEntryIcon(entry) {
    const column =
      [...entry.querySelectorAll(entryIconColumn)].find(
        (element) => element.closest('[data-entry-key]') === entry,
      ) ?? null
    return { column, icon: column?.firstElementChild ?? null }
  },
  tableBody(scope) {
    return {
      body: scope.querySelector('tbody'),
      scrollSurface: scope.querySelector('[data-scroll][role="region"]'),
      emptyState: emptyState(scope),
      errorState: scope.querySelector('[data-collection-failure="initial"]'),
    }
  },
}
