import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h } from 'vue'
import {
  createUiPopoverControl,
  UiApp,
  UiButton,
  UiPopover,
  UiTooltip,
  useUiStacking,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

declare global {
  interface Window {
    inspectPlainTooltip(element: Element): {
      exact: boolean
      host?: string | null
    }
  }
}

const control = createUiPopoverControl()
const app = createUiApplication({
  setup() {
    const stacking = useUiStacking()
    window.inspectPlainTooltip = (element) => {
      const handle = stacking.fromElement(element)
      const info = handle && stacking.describe(handle)
      return {
        exact: info?.target === element,
        host: info?.host?.getAttribute('data-ui-overlay'),
      }
    }
    return () =>
      h(UiApp, () =>
        h('main', { style: 'padding:32px' }, [
          h(
            UiPopover,
            { control, title: 'Test panel' },
            {
              host: ({
                buttonTrigger,
              }: {
                buttonTrigger: Record<string, unknown>
              }) =>
                h(
                  UiButton,
                  { ...buttonTrigger, onClick: () => void control.run() },
                  () => 'Open panel',
                ),
              default: () =>
                h(
                  UiTooltip,
                  { text: 'Nested help' },
                  {
                    host: ({ trigger }: { trigger: Record<string, unknown> }) =>
                      h(UiButton, trigger, () => 'Help'),
                  },
                ),
            },
          ),
        ]),
      )
  },
})
const host = document.body.appendChild(document.createElement('div'))
void app.ui.ready.then(() => app.mount(host))
