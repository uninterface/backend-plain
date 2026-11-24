<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { shallowRef } from 'vue'
  import { useUiLoadingSurface } from '@uninterface/uninterface/backend'
  import LoadingRegion from './UiLoadingRegion.vue'
  defineOptions({ inheritAttrs: false })
  const loadingHost = shallowRef<HTMLElement | { $el: HTMLElement }>()
  const loadingSurface = useUiLoadingSurface(() => loadingHost.value)
  import type { UiCardViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiCardViewProps>()
</script>
<template>
  <div
    ref="loadingHost"
    v-bind="$attrs"
    class="plain-card"
    :data-card-body="bodyLayout ? 'layout' : undefined"
    :data-card-top-end="$slots['top-end'] ? '' : undefined"
    :data-card-level="level"
    :data-card-header="treatment.header"
    :data-card-footer="treatment.footer"
    :data-card-density="treatment.density"
    :data-card-surface="treatment.surface"
    :data-card-elevation="treatment.elevation"
    :data-card-border="treatment.border"
    :data-card-title-size="treatment.titleSize"
    :style="{
      '--plain-card-accent': color
        ? `var(--plain-${color})`
        : 'var(--plain-border)',
    }"
  >
    <div
      v-if="$slots.header || $slots.title || $slots.description"
      key="header"
      class="plain-card-header"
    >
      <slot name="header">
        <div
          v-if="$slots.title"
          class="plain-card-title"
        >
          <slot name="title" />
        </div>
        <div
          v-if="$slots.description"
          class="plain-card-description"
        >
          <slot name="description" />
        </div>
      </slot>
    </div>
    <div
      key="body"
      class="plain-card-body"
    >
      <slot />
    </div>
    <div
      v-if="$slots['top-end']"
      class="plain-card-top-end"
    >
      <slot name="top-end" />
    </div>
    <div
      v-if="$slots.footer"
      key="footer"
      class="plain-card-footer"
    >
      <slot name="footer" />
    </div>
  </div>
  <LoadingRegion
    :surface="loadingSurface"
    :loading="loading"
    :label="loadingLabel"
  />
</template>
