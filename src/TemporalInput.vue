<script setup lang="ts">
  import { ref } from 'vue'
  import {
    useUiTemporalRange,
    focusUiTarget,
  } from '@uninterface/uninterface/backend'
  import type {
    UiTemporalInputViewProps,
    UiFocusHandle,
  } from '@uninterface/uninterface/backend'
  import TemporalEditor from './TemporalEditor.vue'
  import TemporalAction from './TemporalAction.vue'
  import TemporalNextDayIcon from './TemporalNextDayIcon.vue'
  import InputFrame from './UiInputFrame.vue'
  import { useTemporalRangeLayout } from './temporalRangeLayout'
  const props = defineProps<UiTemporalInputViewProps>()
  defineOptions({ inheritAttrs: false })
  const editor = ref<UiFocusHandle>()
  const host = ref<HTMLElement>()
  const stacked = useTemporalRangeLayout(host, () => props.kind)
  const modeTarget = ref<HTMLSelectElement>()
  const endpoints = new Map<string, UiFocusHandle>()
  function endpointRef(side: string, value: unknown) {
    if (value) endpoints.set(side, value as UiFocusHandle)
    else endpoints.delete(side)
  }
  const {
    range,
    mode,
    modes,
    messages,
    nextDay,
    display: displayEndpoint,
    selectMode,
    updateEndpoint,
    clear,
  } = useUiTemporalRange(props)
  async function focus() {
    if (!props.options.range) return editor.value?.focus() ?? null
    for (const side of ['start', 'end'] as const) {
      const result = await endpoints.get(side)?.focus()
      if (result === true) return true
    }
    return focusUiTarget(
      () => modeTarget.value,
      () => props.binding.disabled || props.readonly,
    )
  }
  defineExpose({ focus })
</script>
<template>
  <div
    v-if="options.range"
    ref="host"
    class="plain-temporal-host"
  >
    <InputFrame
      :binding="binding"
      :description-binding="binding"
      :label="label"
      :readonly="readonly"
      :dirty="!!value"
      :focus-editor="focus"
      data-temporal-range
    >
      <template #leading>
        <span
          v-if="modes.length > 1"
          class="plain-temporal-mode"
          :data-disabled="binding.disabled || readonly ? '' : undefined"
        >
          <span
            class="plain-temporal-mode-display"
            aria-hidden="true"
          >
            {{ modes.find((item) => item.value === mode)?.symbol }}
            <span>▾</span>
          </span>
          <select
            ref="modeTarget"
            class="plain-temporal-mode-select"
            data-temporal-mode
            :aria-label="messages.rangeMode"
            :title="modes.find((item) => item.value === mode)?.label"
            :value="mode"
            :disabled="binding.disabled || readonly"
            @change="
              selectMode(($event.target as HTMLSelectElement).value as any)
            "
          >
            <option
              v-for="item in modes"
              :key="item.value"
              :value="item.value"
            >
              {{ item.symbol }} {{ item.label }}
            </option>
          </select>
        </span>
      </template>
      <div
        class="plain-temporal-range"
        :data-kind="kind"
        :data-stacked="stacked ? '' : undefined"
      >
        <template
          v-for="side in ['start', 'end'] as const"
          :key="side"
        >
          <span
            v-if="side === 'end'"
            class="plain-temporal-separator"
            aria-hidden="true"
          >
            –
          </span>
          <div
            class="plain-temporal-boundary"
            :data-side="side"
          >
            <span
              v-if="range[side] === null"
              class="plain-badge"
              data-temporal-infinity
              :aria-label="
                (side === 'start' ? startLabel : endLabel) +
                ' — ' +
                messages.rangeUnrestricted
              "
              :title="
                (side === 'start' ? startLabel : endLabel) +
                ' — ' +
                messages.rangeUnrestricted
              "
            >
              ∞
            </span>
            <TemporalEditor
              v-else
              :ref="(value) => endpointRef(side, value)"
              v-bind="$attrs"
              :binding="{
                ...binding,
                id: binding.id + '-' + side,
                disabled: binding.disabled,
              }"
              :kind="kind"
              :value="displayEndpoint(side)"
              :precision="options.precision ?? 'minute'"
              :presentation="presentation"
              :date-format-wish="dateFormatWish"
              :readonly="readonly"
              :label="
                label + ' — ' + (side === 'start' ? startLabel : endLabel)
              "
              :eligible="eligible"
              :update="(value) => updateEndpoint(side, value)"
              :blur="blur"
            />
          </div>
        </template>
      </div>
      <span
        class="plain-temporal-spacer"
        aria-hidden="true"
      />
      <template #trailing>
        <span
          v-if="kind === 'time' && mode === 'bounded'"
          :style="{ visibility: nextDay ? undefined : 'hidden' }"
          :aria-hidden="!nextDay || undefined"
          data-temporal-next-day
          role="img"
          :aria-label="nextDay ? messages.rangeNextDay : undefined"
          :title="nextDay ? messages.rangeNextDay : undefined"
        >
          <TemporalNextDayIcon />
        </span>
        <TemporalAction
          clear
          :label="clearLabel"
          :disabled="binding.disabled || readonly"
          @click="clear"
        />
      </template>
    </InputFrame>
  </div>
  <TemporalEditor
    v-else
    ref="editor"
    v-bind="$attrs"
    :binding="binding"
    :kind="kind"
    :value="typeof value === 'string' ? display(value) : ''"
    :precision="options.precision ?? 'minute'"
    :presentation="presentation"
    :date-format-wish="dateFormatWish"
    :readonly="readonly"
    :label="label"
    :eligible="eligible"
    :update="(value) => update(value === '' ? null : candidate(value))"
    :blur="blur"
  />
</template>
