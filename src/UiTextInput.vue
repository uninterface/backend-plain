<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useUiFieldFailure } from '@uninterface/uninterface/backend'
  import { useUiFieldDescription } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { focusUiTarget } from '@uninterface/uninterface/backend'
  import { ref } from 'vue'
  import type { UiTextInputViewProps } from '@uninterface/uninterface/backend'
  import ShowIcon from './icons/show.vue'
  import HideIcon from './icons/hide.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiTextInputViewProps>()
  const invalidPresentation = useUiFieldFailure(
    () => props.descriptionBinding ?? props.binding,
  )
  defineEmits<{ update: [value: string]; blur: [] }>()
  const element = ref<HTMLInputElement | HTMLTextAreaElement>()
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value,
        () => props.binding.disabled,
      ),
  })
  const controlSize = useControlSize('UiTextInput')
  const description = useUiFieldDescription(
    () => props.descriptionBinding ?? props.binding,
  )
</script>
<template>
  <span
    class="plain-text-surface"
    :data-ui-control-frame="frame?.owner"
    :style="{
      '--ui-text-min-width':
        minWidthCharacters === undefined
          ? undefined
          : `${minWidthCharacters}ch`,
      '--ui-text-max-width':
        maxWidthCharacters === undefined
          ? undefined
          : `${maxWidthCharacters}ch`,
    }"
    :data-ui-frame-editor="frame?.owner === 'parent' ? '' : undefined"
    :class="[
      !multiline && ['plain-input', controlSize],
      {
        'plain-invalid':
          !multiline && frame?.owner !== 'parent' && invalidPresentation,
        'plain-text-disabled': binding.disabled,
        'plain-text-multiline': multiline,
      },
    ]"
  >
    <slot name="leading" />
    <component
      :is="multiline ? 'textarea' : 'input'"
      :class="
        multiline
          ? [
              'plain-input',
              controlSize,
              {
                'plain-invalid':
                  frame?.owner !== 'parent' && invalidPresentation,
              },
            ]
          : 'plain-text-editor'
      "
      v-bind="$attrs"
      ref="element"
      :id="binding.id"
      :type="multiline ? undefined : type"
      :readonly="readonly"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :value="value"
      :disabled="binding.disabled"
      :aria-busy="binding.validating || undefined"
      :aria-required="binding.required || undefined"
      :aria-describedby="description"
      :aria-invalid="binding.invalid || undefined"
      @input="
        $emit(
          'update',
          ($event.target as HTMLInputElement | HTMLTextAreaElement).value,
        )
      "
      @keydown="reveal?.keydown($event)"
      @blur="$emit('blur')"
    />
    <slot name="trailing" />
    <button
      v-if="reveal"
      type="button"
      class="plain-input-action"
      :disabled="binding.disabled"
      :aria-label="reveal.label"
      data-password-reveal
      :aria-pressed="reveal.shown"
      @mousedown.prevent
      @click="reveal.toggle"
    >
      <component
        :is="reveal.shown ? HideIcon : ShowIcon"
        aria-hidden="true"
      />
    </button>
  </span>
</template>
