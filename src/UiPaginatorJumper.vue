<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useId } from 'vue'
  import { useUiFieldStrategies } from '@uninterface/uninterface/backend'
  import FieldFailureTooltip from './FieldFailureTooltip.vue'
  import type { UiPaginatorJumperViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiPaginatorJumperViewProps>()
  const id = `paginator-jumper-${useId()}`
  const policy = useUiFieldStrategies(
    () => ({
      id,
      label: props.label,
      issue: props.error || null,
      validating: false,
      describedBy: props.error ? `${id}-issue` : undefined,
    }),
    { failureModes: ['show-tooltip', 'show-below'] },
  )
  function keydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.isComposing) return
    event.preventDefault()
    event.stopPropagation()
    void props.commit('enter')
  }
</script>
<template>
  <div
    class="plain-paginator-jumper"
    :aria-busy="pending"
  >
    <label :for="id">{{ label }}</label>
    <FieldFailureTooltip
      :message="policy.failure === 'show-tooltip' ? policy.issue : null"
      :id="`${id}-issue`"
    >
      <input
        class="plain-input"
        :class="{ 'plain-invalid': error }"
        :id="id"
        type="text"
        size="5"
        inputmode="numeric"
        autocomplete="off"
        :value="value"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="policy.describedBy"
        @input="update(($event.target as HTMLInputElement).value)"
        @keydown="keydown"
        @blur="commit('blur')"
      />
    </FieldFailureTooltip>
    <div
      v-if="policy.issue && policy.failure !== 'show-tooltip'"
      :id="`${id}-issue`"
      class="plain-field-feedback"
      role="alert"
    >
      {{ policy.issue }}
    </div>
  </div>
</template>
