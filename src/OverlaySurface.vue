<script setup lang="ts">
  import DrawerDepth from './DrawerDepth.vue'
  import FooterActions from './FooterActions.vue'
  import {
    useUiOverlayView,
    useUiDrawerResize,
    createUiModalCssMotion,
    type UiOverlayViewProps,
  } from '@uninterface/uninterface/backend'
  import type { UiOverlayCloseTrigger } from '@uninterface/uninterface'
  import { uiFocusPresentation } from './focus'
  import CloseIcon from './icons/cancel.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiOverlayViewProps & {
      kind: 'drawer' | 'popover'
      anchor?: HTMLElement
      trigger?: HTMLElement
    }
  >()
  const emit = defineEmits<{
    cancel: [reason: UiOverlayCloseTrigger]
    'update:expanded': [expanded: boolean]
    failure: [error: unknown]
  }>()
  const {
    surface,
    visible,
    cssPanel,
    heading,
    open,
    close,
    widthStyle,
    cancel,
    pointerdown,
    click,
  } = useUiOverlayView(
    () => props,
    props.kind,
    () => props.anchor,
    () => props.trigger,
    emit,
    props.kind === 'drawer' ? createUiModalCssMotion('plain-drawer') : {},
  )
  const resize = useUiDrawerResize(() => props, surface)
  defineExpose({ open, close, element: surface })
</script>
<template>
  <component
    v-bind="$attrs"
    :is="modal ? 'dialog' : 'div'"
    :role="modal ? undefined : 'dialog'"
    :id="`${id}-surface`"
    ref="surface"
    :popover="modal || docked || cssPanel ? undefined : 'manual'"
    :inert="!active || undefined"
    :class="['plain-modal', 'plain-overlay']"
    :style="[
      widthStyle,
      drawerSizing
        ? ['start', 'end'].includes(edge)
          ? { width: `${drawerSizing.extent}px` }
          : { height: `${drawerSizing.extent}px` }
        : undefined,
      kind === 'drawer' ? resize.style() : undefined,
    ]"
    :data-docked="docked || undefined"
    :data-css-panel="cssPanel || undefined"
    :hidden="((docked || cssPanel) && !active && !visible) || undefined"
    :data-ui-overlay="kind"
    :data-edge="edge"
    :data-panel="panel || undefined"
    :aria-modal="modal ? true : undefined"
    :aria-labelledby="title ? `${id}-title` : undefined"
    :aria-label="title ? undefined : name"
    @cancel="cancel"
    @pointerdown="pointerdown"
    @click="click"
  >
    <div class="plain-modal-surface">
      <header
        v-if="
          title || closeOn.includes('close-button') || $slots['header-extra']
        "
        class="plain-modal-header"
      >
        <div class="plain-overlay-heading">
          <h2
            v-if="title"
            :id="`${id}-title`"
            ref="heading"
            tabindex="-1"
            v-bind="uiFocusPresentation"
          >
            {{ title }}
          </h2>
          <button
            v-if="closeOn.includes('close-button')"
            type="button"
            class="plain-button plain-color-secondary plain-variant-outline plain-modal-close"
            :aria-label="closeLabel"
            :disabled="pendingClose || disabled"
            @click="emit('cancel', 'close-button')"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>
        <slot name="header-extra" />
      </header>
      <div
        class="plain-modal-body"
        :ref="!title ? (el: any) => (heading = el?.$el ?? el) : undefined"
        role="region"
        tabindex="0"
        :aria-label="name"
        v-bind="uiFocusPresentation"
      >
        <slot />
      </div>
      <footer
        v-if="$slots.actions || $slots.footer"
        class="plain-modal-footer"
      >
        <FooterActions v-if="$slots.actions">
          <slot name="actions" />
        </FooterActions>
        <slot
          v-else
          name="footer"
        />
      </footer>
    </div>
    <DrawerDepth
      v-if="kind === 'drawer' && !docked"
      :edge="edge"
    />
    <div
      v-if="drawerSizing?.enabled"
      class="plain-drawer-resize"
      v-bind="resize.attributes()"
    />
  </component>
</template>
