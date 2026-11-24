<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'

  import { Teleport } from 'vue'
  import {
    useUiLoadingRegion,
    type UiLoadingRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import Indicator from './UiLoadingIndicator.vue'
  const props = withDefaults(defineProps<UiLoadingRegionViewProps>(), {
    announce: true,
    manageBusy: true,
  })
  const { visible, overlay, style, announcementHost, announcement } =
    useUiLoadingRegion(props)
  useUiZView({
    host: () => props.surface.overlayHost.value!,
    targets: () => (overlay.value ? [overlay.value] : []),
  })
</script>
<template>
  <Teleport
    v-if="visible && surface.overlayHost.value"
    :to="surface.overlayHost.value"
  >
    <div
      ref="overlay"
      data-ui-loading-overlay
      class="plain-loading-region"
      :data-custom="$slots.default ? '' : undefined"
      :style="style"
    >
      <slot><Indicator :label="label" /></slot>
    </div>
  </Teleport>
  <Teleport
    v-if="announcementHost && announce !== false"
    :to="announcementHost"
  >
    <span
      class="plain-loading-announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </span>
  </Teleport>
</template>
