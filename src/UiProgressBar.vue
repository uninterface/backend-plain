<script setup lang="ts">
  import {
    useUiZView,
    type UiProgressBarViewProps,
  } from '@uninterface/uninterface/backend'
  useUiZView()
  defineProps<UiProgressBarViewProps>()
</script>
<template>
  <div
    class="plain-progress-bar"
    data-ui-progress-bar
    :data-state="value === null ? 'indeterminate' : 'determinate'"
    role="progressbar"
    :aria-label="label"
    :aria-valuetext="valueText"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="value ?? undefined"
    :style="{ '--plain-progress-color': `var(--plain-${color})` }"
  >
    <span
      :style="{
        inlineSize: fraction === null ? undefined : `${fraction * 100}%`,
      }"
    />
  </div>
</template>
