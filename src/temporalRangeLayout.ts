import { computed, ref, watch, type Ref } from 'vue'

/** Local control allocation; independent of the application's viewport profile. */
export function useTemporalRangeLayout(
  host: Ref<HTMLElement | undefined>,
  kind: () => 'date' | 'time' | 'datetime',
) {
  const widthInRem = ref(Number.POSITIVE_INFINITY)
  watch(
    host,
    (element, _previous, cleanup) => {
      const view = element?.ownerDocument.defaultView
      if (!element || !view) return
      const measure = () => {
        const rootSize =
          Number.parseFloat(
            view.getComputedStyle(element.ownerDocument.documentElement)
              .fontSize,
          ) || 16
        widthInRem.value = element.getBoundingClientRect().width / rootSize
      }
      let frame: number | undefined
      const schedule = () => {
        if (frame !== undefined) return
        // Stacking changes the observed host's height. Commit outside the
        // ResizeObserver delivery cycle to avoid resize-loop notifications.
        frame = view.requestAnimationFrame(() => {
          frame = undefined
          measure()
        })
      }
      const observer = view.ResizeObserver && new view.ResizeObserver(schedule)
      observer?.observe(element)
      observer?.observe(element.ownerDocument.documentElement)
      view.addEventListener('resize', schedule)
      measure()
      cleanup(() => {
        observer?.disconnect()
        if (frame !== undefined) view.cancelAnimationFrame(frame)
        view.removeEventListener('resize', schedule)
      })
    },
    { flush: 'post' },
  )
  return computed(
    () => widthInRem.value <= { date: 28, time: 24, datetime: 40 }[kind()],
  )
}
