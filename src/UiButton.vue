<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useControlSize } from './controlSize'
  import {
    focusUiTarget,
    useUiButtonPresentation,
  } from '@uninterface/uninterface/backend'
  import { ref, useAttrs } from 'vue'
  import type { UiButtonViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const attrs = useAttrs()
  const props = withDefaults(defineProps<UiButtonViewProps>(), {
    color: 'secondary',
  })
  const element = ref<HTMLButtonElement>()
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value,
        () => Boolean(props.disabled || props.loading),
      ),
  })
  const {
    variant: buttonVariant,
    width: buttonWidth,
    iconOnly,
    hint,
  } = useUiButtonPresentation(props, { collectionActionVariant: 'bordered' })
  const controlSize = useControlSize('UiButton')
</script>
<template>
  <span
    class="plain-button-host"
    :data-ui-button-width="buttonWidth()"
    :data-ui-control-frame="frame?.owner"
  >
    <button
      ref="element"
      v-bind="attrs"
      :type="type"
      :form="form"
      :title="hint()"
      :data-ui-button-variant="buttonVariant()"
      :disabled="disabled || loading"
      :aria-busy="loading || undefined"
      class="plain-button"
      :class="[
        controlSize,
        [
          `plain-color-${color}`,
          `plain-variant-${buttonVariant() ?? 'filled'}`,
        ],
      ]"
    >
      <span
        v-if="loading"
        class="plain-button-indicator"
        aria-hidden="true"
      ></span>
      <span
        v-if="$slots.icon"
        class="plain-button-icon"
        aria-hidden="true"
      >
        <slot name="icon" />
      </span>
      <span
        class="plain-button-label"
        :class="{ 'plain-button-label-hidden': iconOnly() }"
      >
        <slot />
      </span>
    </button>
    <span
      class="plain-button-status"
      role="status"
      aria-live="polite"
    >
      {{ loading ? loadingLabel : '' }}
    </span>
  </span>
</template>
