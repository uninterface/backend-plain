<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiEmptyViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiEmptyViewProps>()
</script>
<template>
  <div class="plain-empty">
    <div
      v-if="$slots.icon"
      class="plain-empty-icon"
    >
      <slot name="icon" />
    </div>
    <div>
      <slot>{{ label }}</slot>
    </div>
    <div
      v-if="$slots.actions"
      class="plain-empty-actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
