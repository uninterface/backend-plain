import { h, nextTick, reactive } from 'vue'
import {
  createUiFieldControl,
  createUiFormControl,
  UiButton,
  UiField,
  UiForm,
  UiTextInput,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountFieldFeedback() {
  const name = createUiFieldControl('Record', undefined, [
    (value) => (value ? null : 'Name is required.'),
  ])
  const form = createUiFormControl({ name })
  const state = reactive({
    submissions: [] as string[],
    errors: [] as string[],
  })
  const app = createUiApplication({
    render: () =>
      h(
        UiForm,
        {
          label: 'Record',
          control: form,
          save: async (value: { name: string }) => {
            state.submissions.push(value.name)
          },
        },
        () => [
          h(UiField, { field: name, label: 'Name', required: true }, () =>
            h(UiTextInput),
          ),
          h(
            UiButton,
            { binding: form.bindings.submitButton },
            () => 'Save record',
          ),
          h(
            'output',
            { 'data-testid': 'save-count' },
            String(state.submissions.length),
          ),
        ],
      ),
  })
  app.config.errorHandler = (error) => state.errors.push(String(error))
  await app.ui.ready
  const host = document.body.appendChild(document.createElement('div'))
  app.mount(host)
  await nextTick()
  return {
    host,
    state,
    dispose() {
      app.unmount()
      form.dispose()
      host.remove()
    },
  }
}
