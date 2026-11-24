<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import type { UiAppViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiAppViewProps>()
  const emit = defineEmits<{ availableHeight: [value: number | undefined] }>()
  const root = ref<HTMLElement>()
  let observer: ResizeObserver | undefined
  const measure = () =>
    emit(
      'availableHeight',
      props.hosting === 'viewport'
        ? Math.max(0, root.value?.getBoundingClientRect().height ?? 0)
        : undefined,
    )
  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      observer.observe(root.value!)
    }
    window.addEventListener('resize', measure)
    measure()
  })
  watch(
    () => props.hosting,
    async () => {
      await nextTick()
      measure()
    },
  )
  onUnmounted(() => {
    observer?.disconnect()
    window.removeEventListener('resize', measure)
  })
</script>
<template>
  <div
    ref="root"
    class="plain-app"
    :class="{ 'plain-app-viewport': hosting === 'viewport' }"
  >
    <slot />
  </div>
</template>
