<script setup lang="ts">
  import { useUiControlFrameParticipant } from '@uninterface/uninterface/backend'
  import { computed, ref, watch } from 'vue'
  import {
    useUiTemporalEditor,
    type UiTemporalEditorViewProps,
    type UiFocusHandle,
  } from '@uninterface/uninterface/backend'
  import UiTextInput from './UiTextInput.vue'
  import TemporalNativeEditor from './TemporalNativeEditor.vue'
  import { nativeTemporalSupported } from './temporalNative'
  import TemporalAction from './TemporalAction.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiTemporalEditorViewProps & {
      extendedHours?: boolean
      unbounded?: boolean
      boundaryLabel?: string
      toggleBoundary?: () => void
    }
  >()
  const nativeProps = computed(() => {
    // These select the editor; they are not native input attributes. In
    // particular, HTML unbounded is presence-based even when its value is false.
    const { extendedHours, unbounded, ...view } = props
    return view
  })
  const { text, focused, update, blur } = useUiTemporalEditor(props)
  const editor = ref<UiFocusHandle>()
  const { frame } = useUiControlFrameParticipant({
    focus: () => editor.value?.focus() ?? Promise.resolve(null),
    invalid: () => props.binding.invalid,
  })
  // Keep the native editor for its own partial draft; fall back only for
  // values/configuration that cannot be represented by the browser.
  const nativeDraft = ref<string>()
  const native = computed(
    () =>
      !focused.value &&
      nativeTemporalSupported({ ...props, value: '' }) &&
      (nativeTemporalSupported(props) || props.value === nativeDraft.value),
  )
  watch(
    native,
    (active) => {
      if (!active) nativeDraft.value = undefined
    },
    { flush: 'sync' },
  )
  function nativeUpdate(value: string) {
    nativeDraft.value = value
    props.update(value)
  }
  defineExpose({ focus: () => editor.value?.focus() ?? Promise.resolve(null) })
</script>
<template>
  <TemporalNativeEditor
    v-if="native"
    ref="editor"
    v-bind="{ ...$attrs, ...nativeProps }"
    :frame="frame"
    :update="nativeUpdate"
  />
  <div
    v-else
    class="plain-temporal-editor"
    :class="{ 'plain-temporal-part': frame.owner === 'parent' }"
  >
    <UiTextInput
      ref="editor"
      v-bind="$attrs"
      :binding="binding"
      :frame="frame"
      data-temporal-text-input
      :aria-label="label || $attrs['aria-label']"
      :value="unbounded ? '∞' : text"
      :size="
        Math.max(text.length, kind === 'date' ? 10 : kind === 'time' ? 5 : 16)
      "
      type="text"
      inputmode="text"
      autocomplete="off"
      :readonly="readonly || unbounded"
      @update="update"
      @focus="focused = true"
      @blur="blur"
    >
      <template
        v-if="toggleBoundary"
        #trailing
      >
        <TemporalAction
          :label="boundaryLabel ?? ''"
          :active="unbounded"
          :disabled="binding.disabled || readonly"
          @click="toggleBoundary"
        />
      </template>
    </UiTextInput>
  </div>
</template>
