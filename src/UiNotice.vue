<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import InfoIcon from './icons/info.vue'
  import SuccessIcon from './icons/success.vue'
  import WarningIcon from './icons/warning.vue'
  import ErrorIcon from './icons/error.vue'
  const icons = {
    info: InfoIcon,
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon,
  }

  import CloseIcon from './icons/cancel.vue'
  import type { UiNoticeViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiNoticeViewProps>()
</script>
<template>
  <div
    class="plain-notice"
    :data-variant="variant"
    :style="{
      '--plain-notice-color': color
        ? `var(--plain-${color})`
        : 'var(--plain-text)',
    }"
  >
    <span
      v-if="$slots.icon || kind !== 'custom'"
      class="plain-notice-icon"
      aria-hidden="true"
    >
      <slot
        v-if="$slots.icon"
        name="icon"
      />
      <component
        v-else-if="kind !== 'custom'"
        :is="icons[kind]"
      />
    </span>
    <div class="plain-notice-content">
      <strong
        v-if="title"
        class="plain-notice-title"
      >
        {{ title }}
      </strong>
      <div v-if="$slots.default || message || details?.length">
        <slot>
          <div v-if="message">{{ message }}</div>
          <ul v-if="details?.length">
            <li
              v-for="(detail, index) in details"
              :key="index"
            >
              {{ detail }}
            </li>
          </ul>
        </slot>
      </div>
      <div
        v-if="$slots.actions"
        class="plain-notice-actions"
      >
        <slot name="actions" />
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="plain-button plain-color-secondary plain-variant-outline plain-notice-close"
      :aria-label="dismissLabel"
      @click="onDismissRequest"
    >
      <CloseIcon aria-hidden="true" />
    </button>
  </div>
</template>
