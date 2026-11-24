<script setup lang="ts">
  import { watch, type ObjectDirective } from 'vue'
  import { ref } from 'vue'
  import {
    focusUiTarget,
    useUiFieldDescription,
    useUiFieldFailure,
    type UiTemporalEditorViewProps,
  } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { incompleteTemporalValue } from './temporalNative'
  import TemporalAction from './TemporalAction.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiTemporalEditorViewProps & {
      boundaryLabel?: string
      toggleBoundary?: () => void
    }
  >()
  const element = ref<HTMLInputElement>()
  const description = useUiFieldDescription(() => props.binding)
  const invalid = useUiFieldFailure(() => props.binding)
  const size = useControlSize('UiTextInput')
  let reported: string | undefined
  // A value prop is reapplied on Vue patches even if unchanged. Assign only for
  // external changes: assigning '' would erase browser-owned partial segments.
  const vNativeValue: ObjectDirective<HTMLInputElement, string> = {
    mounted(input, binding) {
      input.value = binding.value
    },
    updated(input, binding) {
      if (binding.value === reported) return
      if (binding.value !== binding.oldValue) input.value = binding.value
    },
  }
  watch(
    () => props.value,
    (value) => {
      if (value !== reported) reported = undefined
    },
    { flush: 'sync' },
  )
  function update(event: Event) {
    if (props.binding.disabled || props.readonly) return
    const input = event.target as HTMLInputElement
    reported = input.validity.badInput
      ? incompleteTemporalValue(props.kind)
      : input.value
    props.update(reported)
  }
  function show() {
    if (props.binding.disabled || props.readonly) return
    // Must run synchronously during a user gesture. Browser-owned picker UI
    // has no interoperable open/close events or DOM dialog to manage.
    try {
      element.value?.showPicker?.()
    } catch {
      element.value?.focus()
    }
  }
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value,
        () => props.binding.disabled,
      ),
  })
</script>
<template>
  <div
    class="plain-temporal-editor"
    :class="{ 'plain-temporal-part': frame?.owner === 'parent' }"
  >
    <span
      class="plain-text-surface plain-input"
      :data-ui-control-frame="frame?.owner"
      :class="[
        size,
        {
          'plain-invalid': frame?.owner !== 'parent' && invalid,
          'plain-text-disabled': binding.disabled,
        },
      ]"
    >
      <input
        v-bind="$attrs"
        ref="element"
        v-native-value="value"
        class="plain-text-editor plain-temporal-native"
        data-temporal-html-input
        :id="binding.id"
        :type="kind === 'datetime' ? 'datetime-local' : kind"
        :step="kind === 'date' ? 1 : precision === 'second' ? 1 : 60"
        :disabled="binding.disabled"
        :readonly="readonly"
        :aria-label="label || ($attrs['aria-label'] as string | undefined)"
        :aria-describedby="description"
        :aria-invalid="binding.invalid || undefined"
        :aria-required="binding.required || undefined"
        :aria-busy="binding.validating || undefined"
        @input="update"
        @change="update"
        @blur="blur"
        @keydown.alt.down.prevent="show"
      />
      <TemporalAction
        v-if="toggleBoundary"
        :label="boundaryLabel ?? ''"
        :active="false"
        :disabled="binding.disabled || readonly"
        @click="toggleBoundary"
      />
    </span>
  </div>
</template>
