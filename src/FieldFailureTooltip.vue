<script setup lang="ts">
  import { ref, watch, onDeactivated } from 'vue'
  import {
    useUiTooltipPosition,
    useUiTooltipAnchorVisibility,
    useUiTooltipPlacement,
    useUiZPopup,
    useUiOverlayTarget,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<{ message: string | null; id: string }>()
  const anchor = ref<HTMLElement>()
  const surface = ref<HTMLElement>()
  const suppressed = ref(false)
  const placement = useUiTooltipPlacement(
    () => anchor.value,
    () => 'top',
  )
  const visible = useUiTooltipAnchorVisibility(
    () => anchor.value,
    () => Boolean(props.message) && !suppressed.value,
  )
  onDeactivated(() => {
    suppressed.value = true
  })
  watch(
    () => props.message,
    () => {
      suppressed.value = false
    },
  )
  const portal = useUiOverlayTarget()
  useUiTooltipPosition(
    anchor,
    surface,
    () => placement.value,
    () => visible.value,
  )
  // This presenter owns its surface; an enclosing popover has a separate owner.
  useUiZPopup(() => surface.value, {
    tooltip: { anchor: () => anchor.value, visible: () => visible.value },
    source: 'field failure tooltip',
  })
</script>
<template>
  <div
    ref="anchor"
    class="plain-field-tooltip-anchor"
  >
    <slot />
    <span
      v-if="message"
      :id="id"
      class="plain-tooltip-description"
    >
      {{ message }}
    </span>
    <Teleport :to="portal ?? 'body'">
      <div
        v-if="visible"
        ref="surface"
        :data-ui-field-tooltip-for="id"
        class="plain-tooltip plain-field-failure-tooltip"
        role="tooltip"
      >
        {{ message }}
      </div>
    </Teleport>
  </div>
</template>
