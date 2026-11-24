<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useUiFieldFailure } from '@uninterface/uninterface/backend'
  import { useUiFieldDescription } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { focusUiTarget } from '@uninterface/uninterface/backend'
  import { computed, ref } from 'vue'
  import type { UiSelectViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiSelectViewProps>()
  const invalidPresentation = useUiFieldFailure(() => props.binding)
  function groups() {
    const result: { label?: string; options: typeof props.options }[] = []
    for (const option of props.options) {
      const last = result.at(-1)
      if (last && last.label === option.group)
        last.options = [...last.options, option]
      else result.push({ label: option.group, options: [option] })
    }
    return result
  }
  const emit = defineEmits<{
    update: [value: string]
    blur: []
    requestLoad: []
  }>()
  // Keep status presentation outside the business value namespace.
  const statusValue = computed(() => {
    let value = '__ui_select_status__'
    while (
      value === props.value ||
      props.options.some((option) => option.value === value)
    )
      value += '_'
    return value
  })
  function requestLoad() {
    if (!props.binding.disabled) emit('requestLoad')
  }
  function keydown(event: KeyboardEvent) {
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'F4'].includes(
        event.key,
      ) ||
      (event.key.length === 1 && !event.ctrlKey && !event.metaKey)
    )
      requestLoad()
  }
  function change(event: Event) {
    const select = event.target as HTMLSelectElement
    const option = select.selectedOptions[0]
    if (
      props.binding.disabled ||
      !props.available ||
      !option ||
      option.disabled ||
      option.hidden
    ) {
      select.value = props.value
      return
    }
    emit('update', select.value)
  }
  const element = ref<HTMLSelectElement>()
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value,
        () => props.binding.disabled,
      ),
  })
  const controlSize = useControlSize('UiSelect')
  const description = useUiFieldDescription(() => props.binding)
</script>
<template>
  <div>
    <select
      :class="[controlSize, { 'plain-invalid': invalidPresentation }]"
      ref="element"
      v-bind="$attrs"
      :id="binding.id"
      class="plain-select"
      :value="value"
      :disabled="binding.disabled"
      :aria-busy="binding.validating || status.pending || undefined"
      :aria-required="binding.required || undefined"
      :aria-describedby="
        [
          description,
          status.message ? `${binding.id}-source-status` : undefined,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      "
      :aria-invalid="binding.invalid || undefined"
      @pointerdown="requestLoad"
      @click="requestLoad"
      @keydown="keydown"
      @change="change"
      @blur="$emit('blur')"
    >
      <template
        v-for="(group, index) in groups()"
        :key="index"
      >
        <optgroup
          v-if="group.label !== undefined"
          :label="group.label"
        >
          <option
            v-for="option in group.options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            :hidden="option.hidden"
          >
            {{ option.label }}
          </option>
        </optgroup>
        <template v-else>
          <option
            v-for="option in group.options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            :hidden="option.hidden"
          >
            {{ option.label }}
          </option>
        </template>
      </template>
      <option
        v-if="!available"
        :value="statusValue"
        data-uninterface-select-status
        disabled
      >
        {{ status.message }}
      </option>
    </select>
    <span
      :id="`${binding.id}-source-status`"
      :data-uninterface-source-state="status.state"
      class="plain-select-status"
      role="status"
    >
      {{ status.message }}
    </span>
  </div>
</template>
