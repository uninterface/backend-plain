<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiFieldFailure,
    useUiFieldDescription,
    type UiPreviewRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiPreviewRegionViewProps>()
  const invalid = useUiFieldFailure(() => props.binding)
  const description = useUiFieldDescription(() => props.binding, undefined)
  const size = useControlSize('UiPreviewRegion')
</script>
<template>
  <div
    v-bind="$attrs"
    :id="binding.id"
    data-ui-preview-region
    :data-extent="extent"
    role="group"
    :aria-label="label"
    :aria-describedby="description"
    :aria-invalid="binding.invalid || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-busy="binding.validating || undefined"
    class="plain-input plain-preview-region"
    :class="[size, { 'plain-invalid': invalid }]"
  >
    <div
      class="plain-preview-viewport"
      data-preview-viewport
    >
      <slot />
    </div>
  </div>
</template>
