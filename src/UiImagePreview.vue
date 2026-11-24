<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiImagePreviewView,
    type UiImagePreviewViewProps,
  } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiImagePreviewViewProps>()
  const { failed, style, loaded, error } = useUiImagePreviewView(props)
</script>
<template>
  <span
    v-bind="$attrs"
    data-ui-image-preview
    :data-fit="fit ?? 'contain'"
    :data-image-failed="failed || undefined"
    class="plain-image-preview"
    :style="style"
  >
    <span
      v-if="failed"
      class="plain-image-preview-broken"
      :role="alt ? 'img' : undefined"
      :aria-label="alt || undefined"
      :aria-hidden="!alt || undefined"
    >
      <svg
        data-image-broken
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M3 3l18 18M9 3h10a2 2 0 0 1 2 2v10M3 9v10a2 2 0 0 0 2 2h14M3 17l5-5 4 4 2-2"
        />
        <circle
          cx="15.5"
          cy="7.5"
          r="1.5"
        />
      </svg>
    </span>
    <img
      v-else
      :key="url"
      :src="url"
      :alt="alt"
      @load="loaded"
      @error="error"
    />
  </span>
</template>
