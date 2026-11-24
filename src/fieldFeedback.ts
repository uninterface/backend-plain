import { onMounted, onScopeDispose, onDeactivated, ref, type Ref } from 'vue'

/** Let a blur-triggering click finish before new feedback changes field geometry. */
export function useFieldFeedbackDelay(
  element: Ref<HTMLElement | undefined>,
  issue: () => string | null | undefined,
  helpVisible: () => boolean,
) {
  const deferred = ref(false)
  const previousHelp = ref(false)
  let document: Document | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let pointer: number | undefined
  function release() {
    clearTimeout(timer)
    timer = undefined
    pointer = undefined
    deferred.value = false
  }
  function down(event: PointerEvent) {
    if (event.button !== 0 || event.isPrimary === false) return
    release()
    const field = element.value
    if (
      !issue() &&
      field?.contains(document?.activeElement ?? null) &&
      !field.contains(event.target as Node)
    ) {
      pointer = event.pointerId
      previousHelp.value = helpVisible()
      deferred.value = true
    }
  }
  function up(event: PointerEvent) {
    if (!deferred.value || event.pointerId !== pointer) return
    // Click normally follows pointerup. Also release when dragging/selection
    // produces no click, without racing delayed touch compatibility clicks.
    timer = setTimeout(release, 500)
  }
  function click() {
    if (!deferred.value) return
    clearTimeout(timer)
    // After native click/default submission, not between pointerdown and click.
    timer = setTimeout(release, 0)
  }
  onMounted(() => {
    document = element.value?.ownerDocument
    document?.addEventListener('pointerdown', down, true)
    document?.addEventListener('pointerup', up, true)
    document?.addEventListener('pointercancel', release, true)
    document?.addEventListener('click', click, true)
    document?.defaultView?.addEventListener('blur', release)
  })
  onDeactivated(release)
  onScopeDispose(() => {
    release()
    document?.removeEventListener('pointerdown', down, true)
    document?.removeEventListener('pointerup', up, true)
    document?.removeEventListener('pointercancel', release, true)
    document?.removeEventListener('click', click, true)
    document?.defaultView?.removeEventListener('blur', release)
  })
  return { deferred, previousHelp }
}
