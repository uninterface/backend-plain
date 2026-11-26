<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { useUiCollectionHeaderField } from '@uninterface/uninterface/backend'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { computed, provide, ref } from 'vue'
  import { checkableLayoutKey } from './fieldLayout'
  import FieldFailureTooltip from './FieldFailureTooltip.vue'
  import { useFieldFeedbackDelay } from './fieldFeedback'
  const checkableCount = ref(0)
  provide(checkableLayoutKey, {
    register() {
      checkableCount.value++
      return () => {
        checkableCount.value--
      }
    },
  })
  import { useControlSize } from './controlSize'
  import { useUiFieldStrategies } from '@uninterface/uninterface/backend'
  import type { UiFieldViewBinding } from '@uninterface/uninterface/backend'
  const props = defineProps<{ binding: UiFieldViewBinding }>()
  const controlSize = useControlSize('UiField')
  const element = ref<HTMLElement>()
  useUiCollectionHeaderField(
    element,
    '.plain-input-frame, .plain-text-surface, .plain-select',
    (editor) => {
      const bounds = editor.getBoundingClientRect()
      if (!editor.matches('select[multiple]'))
        return bounds.top + bounds.height / 2
      // Native multi-select is a listbox: align its first row, not its full height.
      const style = editor.ownerDocument.defaultView!.getComputedStyle(editor)
      const option = editor.querySelector('option')?.getBoundingClientRect()
      const line =
        option?.height ||
        parseFloat(style.lineHeight) ||
        parseFloat(style.fontSize) * 1.2
      return (
        bounds.top +
        (parseFloat(style.borderTopWidth) || 0) +
        (parseFloat(style.paddingTop) || 0) +
        line / 2
      )
    },
  )
  const policy = useUiFieldStrategies(() => props.binding, {
    ...{ feedbackRoot: element },
    help: 'together',
    failureModes: ['show-below', 'show-tooltip'],
    labels: (value) =>
      props.binding.checkable
        ? value === 'above' || value === 'beside'
        : (!checkableCount.value || Boolean(props.binding.group)) &&
          (value === 'above' || (!props.binding.group && value === 'beside')),
  })
  // Use Plain's feedback timing when Core's field policy lacks it.
  const fallback =
    'inlineFeedbackDeferred' in policy.value
      ? undefined
      : useFieldFeedbackDelay(
          element,
          () => policy.value.issue,
          () => policy.value.showHelp,
        )
  const deferFeedback = computed(() =>
    'inlineFeedbackDeferred' in policy.value
      ? policy.value.inlineFeedbackDeferred === true
      : fallback?.deferred.value === true,
  )
  const showHelp = computed(() =>
    fallback?.deferred.value
      ? fallback.previousHelp.value
      : policy.value.showHelp,
  )
</script>
<template>
  <component
    ref="element"
    :data-ui-label-align="policy.labelAlignment"
    :data-ui-checkable="policy.checkableMode"
    :data-ui-checkable-group="
      binding.checkable && binding.group ? true : undefined
    "
    :data-ui-checkable-label-align="
      binding.checkable ? policy.checkableLabelAlignment : undefined
    "
    :is="binding.group ? 'fieldset' : 'div'"
    class="plain-field"
    :class="{
      'plain-invalid': Boolean(binding.issue) && !deferFeedback,
      'plain-checkable-field': checkableCount && !binding.group,
      'plain-field-size-small': controlSize === 'plain-size-small',
      'plain-field-size-large': controlSize === 'plain-size-large',
      'plain-labels-beside':
        policy.labels.startsWith('beside') && !binding.group && !checkableCount,
    }"
    :aria-describedby="binding.group ? policy.describedBy : undefined"
    :aria-busy="binding.group && binding.validating ? true : undefined"
    :aria-invalid="binding.group && binding.issue ? true : undefined"
    v-bind="binding.group ? uiFocusPresentation : {}"
  >
    <legend
      v-if="binding.group"
      class="plain-label"
      :class="{ 'plain-strategy-hidden': policy.labels === 'hidden' }"
    >
      <span
        v-if="policy.marker && policy.markerPosition === 'prefix'"
        class="plain-required"
      >
        {{ binding.requiredLabel }} ·
      </span>
      {{ binding.label }}
      <span
        v-if="policy.marker && policy.markerPosition === 'suffix'"
        class="plain-required"
      >
        · {{ binding.requiredLabel }}
      </span>
      <span
        v-if="binding.requiredLabel && !policy.marker"
        class="plain-strategy-hidden"
      >
        {{ binding.requiredLabel }}
      </span>
    </legend>
    <div
      v-else
      class="plain-label"
      :class="{ 'plain-strategy-hidden': policy.labels === 'hidden' }"
    >
      <label :for="binding.id">
        <span
          v-if="policy.marker && policy.markerPosition === 'prefix'"
          class="plain-required"
          aria-hidden="true"
        >
          {{ binding.requiredLabel }} ·
        </span>
        {{ binding.label }}
        <span
          v-if="policy.marker && policy.markerPosition === 'suffix'"
          class="plain-required"
          aria-hidden="true"
        >
          · {{ binding.requiredLabel }}
        </span>
      </label>
    </div>
    <FieldFailureTooltip
      class="plain-field-editor"
      :message="policy.failure === 'show-tooltip' ? policy.issue : null"
      :id="`${binding.id}-issue`"
    >
      <slot />
    </FieldFailureTooltip>
    <p
      v-if="showHelp"
      :id="`${binding.id}-help`"
      class="plain-help"
    >
      {{ binding.help }}
    </p>
    <div
      v-if="policy.issue && policy.failure !== 'show-tooltip'"
      class="plain-field-feedback"
      :class="{ 'plain-strategy-hidden': deferFeedback }"
    >
      <p
        :id="`${binding.id}-issue`"
        class="plain-issue"
      >
        {{ policy.issue }}
      </p>
    </div>
  </component>
</template>
