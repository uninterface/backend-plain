import {
  browserFieldFeedbackParts,
  type UiTestAdapter,
} from '@uninterface/testing/playwright'
import {
  fieldSelectors,
  temporalPickerParts,
  entryIconColumn,
} from './presentation-parts.mjs'

export const presentationParts = {
  fieldFeedback: (editor) =>
    browserFieldFeedbackParts(editor, fieldSelectors.invalid),
  tableBody(table) {
    const scope = table.locator('xpath=ancestor-or-self::*[@data-scroll][1]')
    return {
      body: table.locator('tbody'),
      scrollSurface: table.locator(
        'xpath=ancestor-or-self::*[@data-scroll and @role="region"][1]',
      ),
      emptyState: scope.locator('.plain-empty'),
      errorState: scope.locator('[data-collection-failure="initial"]'),
    }
  },
  feedbackItem(item) {
    return { content: item.locator('.plain-feedback-content'), surface: item }
  },
  progressBar(bar) {
    return { track: bar, fill: bar.locator(':scope > span') }
  },
  uploadRegion(region) {
    const surface = region
    const chooser = region.locator('[data-upload-choose]')
    return {
      surface,
      chooser,
      chooserFocus: { target: chooser, kind: 'outline' },
    }
  },
  temporalPicker: (picker) =>
    temporalPickerParts((selector) => picker.locator(selector)),
  menuEntryIcon(entry) {
    const column = entry.locator(
      `:is(${entryIconColumn}):not(:scope [data-entry-key] *)`,
    )
    return {
      column,
      icon: column.locator(':scope > *'),
    }
  },
} satisfies Partial<UiTestAdapter>
