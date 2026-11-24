<script setup lang="ts">
  import { Teleport } from 'vue'
  import {
    useUiFloatingView,
    useUiOverlayTarget,
    type UiFloatingViewProps,
  } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiFloatingViewProps>()
  const {
    root,
    ready,
    style,
    movePanel,
    moveStyle,
    editor,
    editing,
    closeMove,
    attributes,
    move,
  } = useUiFloatingView(props)
  const portal = useUiOverlayTarget()
</script>
<template>
  <Teleport
    :to="portal ?? 'body'"
    :disabled="!ready"
  >
    <div
      ref="root"
      class="plain-floating"
      :style="style"
      v-bind="{ ...$attrs, ...attributes }"
    >
      <slot />
      <div
        ref="movePanel"
        :style="moveStyle"
        v-if="editing"
        class="plain-floating-move"
        @pointerdown.stop
        @contextmenu.stop.prevent
      >
        <label>
          {{ positionLabel }}
          <input
            ref="editor"
            type="range"
            min="0"
            max="100"
            step="1"
            :value="position * 100"
            @input="move(Number(($event.target as HTMLInputElement).value))"
          />
        </label>
        <button
          type="button"
          class="plain-button plain-color-primary plain-variant-outline"
          @click="closeMove"
        >
          {{ doneLabel }}
        </button>
      </div>
    </div>
  </Teleport>
</template>
