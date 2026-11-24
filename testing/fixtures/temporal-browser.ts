import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h, nextTick, ref } from 'vue'
import {
  UiField,
  UiDateInput,
  UiTimeInput,
  UiDateTimeInput,
  UiTextInput,
  UiStrategy,
  uiControlSize,
  createUiDateControl,
  createUiTimeControl,
  createUiDateTimeControl,
  createUiFieldControl,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

declare global {
  interface Window {
    plainPresentation: {
      date: ReturnType<typeof createUiDateControl>
      setSize(value: -1 | 0 | 1): Promise<void>
    }
  }
}

async function mountTemporalPresentation() {
  const date = createUiDateControl(
    { start: '2026-10-21', end: '2026-10-23' },
    {
      range: true,
      allowOpenStart: true,
      allowOpenEnd: true,
      allowUnrestricted: true,
    },
  )
  const time = createUiTimeControl(
    { start: '22:00', end: '26:00' },
    {
      range: true,
      allowOpenStart: true,
      allowOpenEnd: true,
      allowUnrestricted: true,
    },
  )
  const datetime = createUiDateTimeControl(
    { start: '2026-10-21T09:00', end: '2026-10-23T17:00' },
    {
      range: true,
      allowOpenStart: true,
      allowOpenEnd: true,
      allowUnrestricted: true,
    },
  )
  const singleDate = createUiDateControl('2026-10-21')
  const password = createUiFieldControl('secret')
  const size = ref<-1 | 0 | 1>(0)
  const host = document.createElement('div')
  host.style.maxWidth = '52rem'
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h(UiStrategy, { use: uiControlSize(size.value) }, () =>
        h('main', [
          h('section', { 'data-range': 'date' }, [
            h(
              UiField,
              { field: date.field, label: 'Date range', group: true },
              () =>
                h(UiDateInput, {
                  binding: date.bindings.dateInput,
                }),
            ),
          ]),
          h('section', { 'data-range': 'time' }, [
            h(
              UiField,
              { field: time.field, label: 'Time range', group: true },
              () =>
                h(UiTimeInput, {
                  binding: time.bindings.timeInput,
                }),
            ),
          ]),
          h('section', { 'data-range': 'datetime' }, [
            h(
              UiField,
              { field: datetime.field, label: 'Datetime range', group: true },
              () =>
                h(UiDateTimeInput, {
                  binding: datetime.bindings.dateTimeInput,
                }),
            ),
          ]),
          h(UiField, { field: singleDate.field, label: 'Single date' }, () =>
            h(UiDateInput, { binding: singleDate.bindings.dateInput }),
          ),
          h(UiField, { field: password, label: 'Password' }, () =>
            h(UiTextInput, { type: 'password', passwordReveal: true }),
          ),
          h('button', { type: 'button' }, 'Outside date editor'),
        ]),
      ),
  })
  await app.ui.ready
  app.mount(host)
  await nextTick()
  window.plainPresentation = {
    date,
    async setSize(value) {
      size.value = value
      await nextTick()
    },
  }
}

void mountTemporalPresentation()
