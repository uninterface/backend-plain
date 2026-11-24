<script setup lang="ts">
  defineProps<{
    label: string
    disabled: boolean
    active?: boolean
    clear?: boolean
  }>()
  defineEmits<{ click: [] }>()
</script>
<template>
  <button
    type="button"
    class="plain-input-action"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
    :aria-pressed="clear ? undefined : active"
    :data-temporal-unbounded="!clear ? '' : undefined"
    :data-temporal-clear="clear ? '' : undefined"
    @mousedown.prevent
    @click="$emit('click')"
  >
    <span aria-hidden="true">{{ clear ? '×' : '∞' }}</span>
  </button>
</template>
