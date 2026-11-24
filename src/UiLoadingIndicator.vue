<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiLoadingIndicatorViewProps } from '@uninterface/uninterface/backend'
  import { computed } from 'vue'
  import {
    useUiStrategy,
    uiControlSizeQuery,
  } from '@uninterface/uninterface/backend'
  const requestedSize = useUiStrategy(uiControlSizeQuery, [-2, -1, 0, 1, 2])
  const scale = computed(() =>
    requestedSize.value.status === 'answered' ? requestedSize.value.value : 0,
  )
  defineProps<UiLoadingIndicatorViewProps>()
</script>
<template>
  <span
    class="plain-loading-indicator"
    :style="{ fontSize: `${1 + scale * 0.125}em` }"
  >
    <span
      class="plain-loading-spinner"
      aria-hidden="true"
    />
    <slot>
      <span class="plain-loading-label-hidden">{{ label }}</span>
    </slot>
  </span>
</template>
