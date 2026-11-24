export function cardParts(find) {
  return {
    header: find(':scope > .plain-card-header'),
    body: find(':scope > .plain-card-body'),
    footer: find(':scope > .plain-card-footer'),
    topEnd: find(':scope > .plain-card-top-end'),
  }
}

export const fieldSelectors = {
  root: '.plain-field',
  surface: '.plain-text-surface,.plain-input-frame',
  required: '.plain-required',
  invalid: '.plain-invalid',
}

export function fieldGroupParts(find) {
  return {
    label: find(':scope > legend, :scope > .plain-label'),
    controlArea: find(':scope > .plain-field-editor'),
  }
}

export function temporalPickerParts(find) {
  return {
    dateInput: find('input[type=date],input[type=datetime-local]'),
    timeInput: find('input[type=time],input[type=datetime-local]'),
    day() {
      return find(':not(*)')
    },
    timeSegment() {
      return find(':not(*)')
    },
  }
}

export const entryIconColumn = '.plain-entry-icon'
