<script setup lang="ts">
  import FooterActions from './FooterActions.vue'
  import { ref } from 'vue'
  import CloseIcon from './icons/cancel.vue'
  import {
    useUiFeedbackView,
    type UiFeedbackItemViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiFeedbackItemViewProps>()
  const root = ref<HTMLElement>()
  const { events, summary, role } = useUiFeedbackView(props, root)
</script>
<template>
  <Transition
    name="plain-feedback"
    appear
    @after-leave="onExited"
  >
    <section
      v-show="open"
      ref="root"
      v-bind="events"
      :id="id"
      data-ui-feedback-item
      :data-feedback-surface="surface"
      :data-closing="!open || undefined"
      class="plain-feedback-item plain-notice"
      :aria-label="title"
      :style="{ '--plain-notice-color': `var(--plain-${color ?? 'text'})` }"
    >
      <div
        class="plain-notice-content plain-feedback-content"
        tabindex="0"
        role="region"
        :aria-label="title || viewportLabel"
      >
        <strong
          v-if="title"
          :class="
            surface === 'notification'
              ? 'plain-notice-title'
              : 'plain-toast-title'
          "
        >
          {{ title }}
        </strong>
        <slot>
          <span v-if="message">{{ message }}</span>
          <ul v-if="details?.length">
            <li
              v-for="(detail, index) in details"
              :key="index"
            >
              {{ detail }}
            </li>
          </ul>
        </slot>
        <FooterActions
          v-if="$slots.actions"
          class="plain-notice-actions"
        >
          <slot name="actions" />
        </FooterActions>
      </div>
      <button
        v-if="dismissible"
        class="plain-button plain-color-secondary plain-variant-outline plain-notice-close"
        type="button"
        :aria-label="closeLabel"
        @click="onDismissRequest"
      >
        <CloseIcon aria-hidden="true" />
      </button>
      <span
        class="plain-feedback-announcement"
        :role="role"
        :aria-live="announcement"
        aria-atomic="true"
      >
        {{ summary }}
      </span>
    </section>
  </Transition>
</template>
