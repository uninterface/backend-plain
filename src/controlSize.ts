import { computed } from 'vue'
import {
  useUiStrategy,
  uiControlSizeQuery,
} from '@uninterface/uninterface/backend'
export function useControlSize(_component: string) {
  const result = useUiStrategy(uiControlSizeQuery, [-2, -1, 0, 1, 2])
  return computed(() =>
    result.value.status === 'answered'
      ? (
          {
            '-1': 'plain-size-small',
            '0': undefined,
            '1': 'plain-size-large',
          } as Record<number, string | undefined>
        )[Math.max(-1, Math.min(1, result.value.value))]
      : undefined,
  )
}
