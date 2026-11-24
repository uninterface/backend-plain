<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { computed, ref } from 'vue'
  import {
    useUiChoiceGroupView,
    useUiFieldDescription,
    useUiFieldFailure,
  } from '@uninterface/uninterface/backend'
  import type { UiChoiceGroupViewProps } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'

  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiChoiceGroupViewProps>()
  const emit = defineEmits<{ choose: [key: string]; blur: [] }>()
  const root = ref<HTMLElement>()
  const size = useControlSize('UiSegmentedSelect')
  const description = useUiFieldDescription(() => props.binding, 'together')
  const failure = useUiFieldFailure(() => props.binding)
  const describedBy = computed(
    () =>
      [
        description.value,
        props.status.message ? `${props.binding.id}-source-status` : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  )
  function targets() {
    return Array.from(
      root.value?.querySelectorAll<HTMLElement>(
        'input[type=radio], input[type=checkbox], [role=radio], [role=checkbox]',
      ) ?? [],
    )
      .filter(
        (element) =>
          element.getAttribute('aria-hidden') !== 'true' &&
          element.tabIndex >= -1,
      )
      .flatMap((element) => {
        const key =
          element
            .closest('[data-uninterface-key]')
            ?.getAttribute('data-uninterface-key') ??
          element.getAttribute('value')
        return key === null || key === undefined ? [] : [{ key, element }]
      })
  }
  const { focus, keydown, focusout } = useUiChoiceGroupView(
    props,
    () => false,
    () => root.value,
    targets,
    (key) => emit('choose', key),
    () => emit('blur'),
    { fieldLabel: true },
  )
  defineExpose({ focus })
  function optionDescription(index: number) {
    return (
      [
        description.value,
        props.options[index].description
          ? `${props.binding.id}-option-${index}-help`
          : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined
    )
  }
</script>
<template>
  <div
    ref="root"
    v-bind="$attrs"
    :id="binding.id"
    role="radiogroup"
    :aria-orientation="orientation"
    :aria-label="label"
    :aria-required="binding.required || undefined"
    :aria-describedby="describedBy"
    :aria-invalid="binding.invalid || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-busy="binding.validating || status.pending || undefined"
    :class="uiFocusPresentation.class"
    data-uninterface-segmented-select
    data-uninterface-choice-group
    class="plain-choice-group"
    @keydown.capture="keydown"
    @focusout="focusout"
  >
    <div class="segmented-scroll">
      <div
        class="plain-segments"
        :class="{ 'plain-segments-vertical': orientation === 'vertical' }"
      >
        <label
          v-for="(option, index) in options"
          :key="option.key"
          :data-uninterface-key="option.key"
          class="plain-segment"
          :class="[size, { 'plain-segment-invalid': failure }]"
        >
          <input
            :id="`${binding.id}-option-${index}`"
            type="radio"
            :name="binding.id"
            :value="option.key"
            :checked="option.selected"
            :disabled="binding.disabled || !available || option.disabled"
            :aria-label="option.label"
            :aria-describedby="optionDescription(index)"
            :aria-invalid="binding.invalid || undefined"
            @change="emit('choose', option.key)"
          />
          <span>{{ option.label }}</span>
          <small
            v-if="option.description"
            :id="`${binding.id}-option-${index}-help`"
          >
            {{ option.description }}
          </small>
        </label>
      </div>
    </div>
    <div
      v-for="item in retained"
      :key="item.key"
      data-uninterface-retained
    >
      {{ item.label }}
      <template v-if="unavailableLabel">— {{ unavailableLabel }}</template>
    </div>
    <div
      :id="`${binding.id}-source-status`"
      role="status"
      :data-uninterface-source-state="status.state"
    >
      {{ status.message }}
    </div>
  </div>
</template>
<style scoped>
  .plain-choice-group {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
  .segmented-scroll {
    max-width: 100%;
    overflow-x: auto;
  }
  .plain-segments {
    display: flex;
    min-width: max-content;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--plain-border);
    border-radius: 0.25rem;
  }
  .plain-segments-vertical {
    flex-direction: column;
  }
  .plain-segment {
    flex: 1 0 0;
    min-width: max-content;
    text-align: center;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.5rem 0.85rem;
    min-height: calc(2.75rem - 2px);
    box-sizing: border-box;
    white-space: nowrap;
    cursor: pointer;
    background: var(--plain-surface);
    color: var(--plain-text);
  }
  .plain-segment:first-child {
    border-start-start-radius: inherit;
    border-end-start-radius: inherit;
  }
  .plain-segment:last-child {
    border-start-end-radius: inherit;
    border-end-end-radius: inherit;
  }
  .plain-segment + .plain-segment {
    border-inline-start: 1px solid var(--plain-border);
  }
  .plain-segments-vertical > .plain-segment {
    border-radius: 0;
  }
  .plain-segments-vertical > .plain-segment:first-child {
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
  }
  .plain-segments-vertical > .plain-segment:last-child {
    border-end-start-radius: inherit;
    border-end-end-radius: inherit;
  }
  .plain-segments-vertical > .plain-segment + .plain-segment {
    border-inline-start: 0;
    border-block-start: 1px solid var(--plain-border);
  }
  .plain-segment > input {
    position: absolute;
    inset: 0 auto auto 0;
    width: 1px;
    height: 1px;
    clip-path: inset(50%);
    overflow: hidden;
  }
  .plain-segment:has(:checked) {
    background: var(--plain-primary);
    color: var(--plain-on-color);
  }
  .plain-segment:has(:disabled) {
    cursor: not-allowed;
    opacity: 0.65;
  }
  .plain-segment:has(:focus-visible) {
    outline: 2px solid var(--plain-focus);
    outline-offset: -2px;
    z-index: 1;
  }
  .plain-segment:has(:checked):has(:focus-visible) {
    outline-color: var(--plain-on-color);
  }
  .plain-segment.plain-segment-invalid {
    box-shadow: inset 0 0 0 1px var(--plain-danger);
  }
  .plain-segment.plain-size-small {
    min-height: calc(2.25rem - 2px);
    font-size: 0.875rem;
    padding: 0.25rem 0.65rem;
  }
  .plain-segment.plain-size-large {
    min-height: calc(3.25rem - 2px);
    font-size: 1.125rem;
    padding: 0.75rem 1rem;
  }
  @media (forced-colors: active) {
    .plain-segment:has(:checked) {
      outline: 2px solid Highlight;
      outline-offset: -3px;
    }
  }
</style>
