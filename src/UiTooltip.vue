<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiTooltipView,
    useUiOverlayTarget,
    type UiTooltipViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiTooltipViewProps>()
  const {
    anchor,
    surface,
    trigger,
    surfaceEvents,
    visible,
    describe,
    placement,
  } = useUiTooltipView(props)
  const portal = useUiOverlayTarget()
  import { useUiTooltipPosition } from '@uninterface/uninterface/backend'
  useUiTooltipPosition(
    anchor,
    surface,
    () => placement.value,
    () => visible.value,
  )
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  useUiZPopup(() => surface.value, {
    tooltip: { anchor: () => anchor.value, visible: () => visible.value },
    source: 'UiTooltip',
  })
</script>
<template>
  <slot
    name="host"
    :trigger="trigger"
  />
  <Teleport :to="portal ?? 'body'">
    <div
      v-if="visible"
      :id="id"
      ref="surface"
      role="tooltip"
      class="plain-tooltip"
      v-bind="surfaceEvents"
    >
      <slot />
    </div>
  </Teleport>
</template>
