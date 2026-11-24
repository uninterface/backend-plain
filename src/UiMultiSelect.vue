<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { computed, ref } from 'vue'
  import {
    focusUiTarget,
    useUiFieldDescription,
    useUiFieldFailure,
    type UiMultiSelectViewProps,
  } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiMultiSelectViewProps>()
  const emit = defineEmits<{
    update: [value: string[]]
    clear: []
    blur: []
    requestLoad: []
  }>()
  const element = ref<HTMLSelectElement>()
  const description = useUiFieldDescription(() => props.binding)
  const invalid = useUiFieldFailure(() => props.binding)
  const size = useControlSize('UiMultiSelect')
  const groups = computed(() => {
    const result: { label?: string; options: typeof props.options }[] = []
    for (const option of props.options) {
      const last = result.at(-1)
      if (last && last.label === option.group)
        last.options = [...last.options, option]
      else result.push({ label: option.group, options: [option] })
    }
    return result
  })
  function change() {
    const selected = Array.from(
      element.value!.selectedOptions,
      (option) => option.value,
    )
    // Restore the controlled DOM immediately; core decides the accepted update.
    for (const option of element.value!.options)
      option.selected = props.value.includes(option.value)
    if (!props.binding.disabled && props.available) emit('update', selected)
  }
  function clear() {
    if (!props.clearable) return
    emit('clear')
    element.value?.focus()
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
  <div class="plain-multiselect">
    <select
      ref="element"
      v-bind="$attrs"
      :id="binding.id"
      multiple
      :size="4"
      class="plain-select plain-multiselect-list"
      :class="[size, { 'plain-invalid': invalid }]"
      :disabled="binding.disabled"
      :aria-required="binding.required || undefined"
      :aria-invalid="binding.invalid || undefined"
      :aria-busy="binding.validating || status.pending || undefined"
      :aria-describedby="
        [
          description,
          status.message ? `${binding.id}-source-status` : undefined,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      "
      @change="change"
      @blur="emit('blur')"
      @pointerdown="emit('requestLoad')"
      @keydown="emit('requestLoad')"
    >
      <template
        v-for="(group, index) in groups"
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
            :selected="value.includes(option.value)"
            :disabled="!available || option.disabled"
          >
            {{ option.label }}
          </option>
        </optgroup>
        <template v-else>
          <option
            v-for="option in group.options"
            :key="option.value"
            :value="option.value"
            :selected="value.includes(option.value)"
            :disabled="!available || option.disabled"
          >
            {{ option.label }}
          </option>
        </template>
      </template>
    </select>
    <button
      v-if="clearable"
      :id="`${binding.id}-clear`"
      type="button"
      class="plain-button plain-multiselect-clear"
      :aria-label="clearLabel"
      :title="clearLabel"
      @click="clear"
    >
      <span aria-hidden="true">×</span>
    </button>
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
