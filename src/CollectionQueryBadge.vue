<script setup lang="ts">
  import {
    useUiCollectionBadgeReorder,
    type UiCollectionBadgeReorder,
  } from '@uninterface/uninterface/backend'
  import { ref } from 'vue'
  const props = defineProps<{
    label: string
    removeLabel: string
    disabled: boolean
    reorder?: UiCollectionBadgeReorder
  }>()
  const removeButton = ref<HTMLButtonElement>()
  defineExpose({
    focus() {
      if (!props.disabled) removeButton.value?.focus()
    },
  })
  const reorderBody = ref<HTMLElement>()
  const reorderView = useUiCollectionBadgeReorder(reorderBody, () => props)
  const emit = defineEmits<{ remove: [] }>()
  function remove() {
    if (!props.disabled) emit('remove')
  }
</script>
<template>
  <span
    class="plain-query-badge"
    role="group"
    :aria-label="label"
  >
    <span
      ref="reorderBody"
      class="plain-query-badge-content"
      v-bind="reorderView.bindings.value"
    >
      <slot />
    </span>
    <span
      v-if="reorder"
      class="plain-query-badge-announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ reorderView.announcement.value }}
    </span>
    <button
      ref="removeButton"
      type="button"
      :disabled="disabled"
      :aria-label="removeLabel"
      @click="remove"
    >
      <slot name="remove" />
    </button>
  </span>
</template>
