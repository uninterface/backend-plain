import type { UiBackendIntegration } from '@uninterface/uninterface/backend'
import icons from './icons'
export default {
  colorMode: {
    attribute: 'data-ui-color-mode',
    light: 'light',
    dark: 'dark',
    default: 'system',
  },
  initialLocale: null,
  locales: {
    resources: { en: null, ar: null, 'zh-Hans': null, 'zh-Hant': null },
    aliases: { zh: 'zh-Hans' },
  },
  icons,
  create: () => ({}),
} satisfies UiBackendIntegration
