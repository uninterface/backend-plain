<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiBadgeViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiBadgeViewProps>()
</script>
<template>
  <span
    class="plain-badge"
    :style="{ color: `var(--plain-${color})` }"
  >
    <slot />
  </span>
</template>
