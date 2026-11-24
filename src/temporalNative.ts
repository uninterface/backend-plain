import type { UiTemporalEditorViewProps } from '@uninterface/uninterface/backend'

/** HTML does not expose unfinished native segments. Never treat badInput as empty. */
export function incompleteTemporalValue(
  kind: UiTemporalEditorViewProps['kind'],
) {
  return kind === 'date'
    ? '____-__-__'
    : kind === 'time'
      ? '__:__'
      : '____-__-__T__:__'
}

export function nativeTemporalSupported(
  props: UiTemporalEditorViewProps & {
    extendedHours?: boolean
    unbounded?: boolean
  },
) {
  if (
    props.extendedHours ||
    props.unbounded ||
    (props.kind !== 'time' && props.dateFormatWish) ||
    props.presentation?.locale ||
    props.presentation?.hourCycle ||
    props.precision === 'millisecond'
  )
    return false
  if (!props.value) return true
  const [date, clock] =
    props.kind === 'time' ? ['', props.value] : props.value.split('T')
  if (props.kind !== 'time') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date!)) return false
    const parsed = new Date(date! + 'T00:00:00Z')
    if (
      Number(date!.slice(0, 4)) < 1 ||
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date
    )
      return false
  }
  if (
    props.kind !== 'date' &&
    !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(clock ?? '')
  )
    return false
  return props.kind === 'date'
    ? props.value === date
    : props.kind === 'time' || props.value.split('T').length === 2
}
