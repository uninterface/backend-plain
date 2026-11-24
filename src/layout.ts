import type { UiLayoutPresentation } from '@uninterface/uninterface/backend'

export const uiLayoutPresentation: UiLayoutPresentation = {
  scrollFocus: { class: 'plain-scroll-focus' },
  peerSpacing: {
    gap: '1rem',
  },
  peerSpacingLevels: {
    [-1]: { gap: '0.5rem' },
    1: { gap: '1.5rem' },
  },
}
