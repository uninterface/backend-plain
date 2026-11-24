<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { nextTick, ref } from 'vue'
  import type { UiCollapsibleViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiCollapsibleViewProps>()
  const emit = defineEmits<{ 'update:expanded': [expanded: boolean] }>()
  const details = ref<HTMLDetailsElement>()
  function request() {
    if (!props.disabled) emit('update:expanded', !props.expanded)
  }
  async function nativeToggle() {
    const element = details.value
    if (!element || element.open === props.expanded) return
    // Browser find-in-page or another native route must still consult the owner.
    if (!props.disabled) emit('update:expanded', element.open)
    await nextTick()
    if (details.value) details.value.open = props.expanded
  }
</script>
<template>
  <details
    ref="details"
    class="plain-collapsible"
    :open="expanded"
    @toggle="nativeToggle"
  >
    <summary
      :id="triggerId"
      class="plain-collapsible-trigger"
      :aria-expanded="expanded"
      :aria-controls="panelId"
      :aria-disabled="disabled || undefined"
      :tabindex="disabled ? -1 : undefined"
      @click.prevent="request"
    >
      <span class="plain-collapsible-summary"><slot name="summary" /></span>
    </summary>
    <div
      :id="panelId"
      class="plain-collapsible-panel"
      :inert="!expanded"
      :aria-hidden="!expanded"
    >
      <slot v-if="mounted" />
    </div>
  </details>
</template>
<style scoped>
  .plain-collapsible-summary {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
</style>
