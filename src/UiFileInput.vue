<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { computed, ref, nextTick } from 'vue'
  import {
    focusUiTarget,
    useUiFieldDescription,
    type UiFileInputViewProps,
  } from '@uninterface/uninterface/backend'
  import InputFrame from './UiInputFrame.vue'

  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiFileInputViewProps>()
  const input = ref<HTMLInputElement>()
  const fieldDescription = useUiFieldDescription(() => props.binding)
  const description = computed(
    () =>
      [
        fieldDescription.value,
        props.file ? props.binding.id + '-filename' : '',
        props.rejection ? props.binding.id + '-rejection' : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  )
  const frameBinding = computed(() => ({
    ...props.binding,
    id: props.binding.id + '-surface',
    invalid: props.binding.invalid || !!props.rejection,
    validating: props.binding.validating || props.pending,
  }))
  const focus = () =>
    focusUiTarget(
      () => input.value,
      () => props.binding.disabled || props.readonly,
    )
  async function changed(event: Event) {
    const target = event.target as HTMLInputElement
    const files = [...(target.files ?? [])]
    // Reset the browser list immediately; accepted descriptor owns the displayed name.
    target.value = ''
    if (files.length) await props.select(files)
  }
  async function clearFile() {
    if (props.binding.disabled || props.readonly) return
    await props.clear()
    await nextTick()
    await focus()
  }
  defineExpose({ focus })
</script>
<template>
  <div
    class="plain-file-input"
    data-ui-file-input
  >
    <InputFrame
      :binding="frameBinding"
      :description-binding="binding"
      :label="label || chooseLabel"
      :readonly="readonly"
      :dirty="!!file"
      :focus-editor="focus"
    >
      <span class="plain-file-chooser">
        <span v-if="!file">{{ chooseLabel }}</span>
        <span
          v-else
          :id="binding.id + '-filename'"
          class="plain-file-name"
          data-ui-file-name
          :title="file?.name"
        >
          {{ file?.name }}
        </span>
        <input
          v-bind="$attrs"
          ref="input"
          :id="binding.id"
          type="file"
          :accept="accept"
          :capture="capture"
          :disabled="binding.disabled || readonly"
          :aria-label="String($attrs['aria-label'] ?? (label || chooseLabel))"
          :aria-describedby="
            [description, $attrs['aria-describedby']]
              .filter(Boolean)
              .join(' ') || undefined
          "
          :aria-required="binding.required || undefined"
          :aria-invalid="binding.invalid || !!rejection || undefined"
          :aria-busy="pending || binding.validating || undefined"
          @change="changed"
        />
      </span>
      <button
        v-if="file"
        type="button"
        class="plain-input-action"
        :disabled="binding.disabled || readonly"
        :aria-label="clearLabel"
        data-ui-file-clear
        @click="clearFile"
      >
        <span aria-hidden="true">×</span>
      </button>
    </InputFrame>
    <div
      v-if="rejection"
      :id="binding.id + '-rejection'"
      role="status"
    >
      {{ rejection }}
    </div>
  </div>
</template>
