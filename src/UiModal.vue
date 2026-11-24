<script setup lang="ts">
  import FooterActions from './FooterActions.vue'
  import { useId } from 'vue'
  import CloseIcon from './icons/cancel.vue'
  import { uiFocusPresentation } from './focus'
  import {
    useUiModalView,
    type UiModalViewProps,
  } from '@uninterface/uninterface/backend'

  const props = defineProps<UiModalViewProps>()
  const emit = defineEmits<{
    cancel: [reason: UiModalViewProps['closeOn'][number]]
  }>()
  const {
    widthStyle,
    vModalPart,
    ModalPart,
    dialog,
    body,
    title: heading,
    open,
    close,
    cancel,
    pointerdown,
    click,
  } = useUiModalView(() => props, emit)
  const id = useId()
  defineExpose({ open, close })
</script>
<template>
  <dialog
    ref="dialog"
    :style="widthStyle"
    class="plain-modal"
    :aria-labelledby="`${id}-title`"
    @cancel="cancel"
    @pointerdown="pointerdown"
    @click="click"
  >
    <div class="plain-modal-surface">
      <header
        v-modal-part="'header'"
        class="plain-modal-header"
      >
        <div class="plain-modal-heading">
          <h2
            :id="`${id}-title`"
            ref="heading"
            v-bind="uiFocusPresentation"
            tabindex="-1"
            class=""
          >
            {{ title }}
          </h2>
          <button
            v-if="closeOn.includes('close-button')"
            type="button"
            class="plain-button plain-color-secondary plain-variant-outline plain-modal-close"
            :disabled="pendingClose"
            :aria-label="closeLabel"
            @click="emit('cancel', 'close-button')"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>
        <ModalPart part="header">
          <slot name="header-extra" />
        </ModalPart>
      </header>
      <div
        ref="body"
        :data-content-scroll="bodyScroll === 'content' || undefined"
        v-bind="uiFocusPresentation"
        role="region"
        :aria-labelledby="`${id}-title`"
        tabindex="0"
        class="plain-modal-body"
      >
        <slot />
      </div>
      <footer
        v-modal-part="'footer'"
        v-if="$slots.footer || $slots.actions"
        class="plain-modal-footer"
      >
        <ModalPart part="footer">
          <FooterActions v-if="$slots.actions">
            <slot name="actions" />
          </FooterActions>
          <slot
            v-else
            name="footer"
          />
        </ModalPart>
      </footer>
    </div>
  </dialog>
</template>
