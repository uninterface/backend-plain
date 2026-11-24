<script setup lang="ts">
  import {
    createUiEntryControl,
    createUiFieldControl,
    UiCard,
    UiField,
    UiInputFrame,
    UiLayout,
    UiNavbar,
    UiSegmentedSelect,
    UiSelect,
    UiStrategy,
    UiTextInput,
    uiControlSize,
  } from '@uninterface/uninterface'
  import { ref } from 'vue'
  const scenario = new URLSearchParams(location.search).get('scenario')
  const amount = createUiFieldControl('125.00', undefined, [
    (value) => (/^\d+(\.\d+)?$/.test(value) ? null : 'Enter an amount.'),
  ])
  const reference = createUiFieldControl('')
  const ordinary = createUiFieldControl('')
  const size = ref<-1 | 0 | 1>(0)
  const selection = createUiFieldControl('first')
  const entries = createUiEntryControl([
    { key: 'first', label: 'First' },
    { key: 'second', label: 'Second' },
  ])
  const short = createUiFieldControl('Example')
  const long = createUiFieldControl('Line one\nLine two\nLine three')
  const cardFields = ['Calendar date', 'Time', 'Local date and time'].map(
    (label) => ({
      label,
      control: createUiFieldControl(''),
    }),
  )
</script>

<template>
  <template v-if="scenario === 'spacing'">
    <UiNavbar aria-label="Field alignment">
      <template #actions>
        <UiField
          :field="selection"
          label="Selection"
        >
          <UiSelect :control="entries" />
        </UiField>
        <UiField
          :field="selection"
          label="Choices"
        >
          <UiSegmentedSelect :control="entries" />
        </UiField>
        <UiField
          :field="short"
          label="Short text"
        >
          <UiTextInput />
        </UiField>
        <UiField
          :field="long"
          label="Long text"
        >
          <UiTextInput multiline />
        </UiField>
      </template>
    </UiNavbar>
    <UiCard>
      <UiLayout>
        <UiField
          v-for="{ label, control } in cardFields"
          :key="label"
          :field="control"
          :label="label"
        >
          <UiTextInput />
        </UiField>
      </UiLayout>
    </UiCard>
  </template>
  <template v-else-if="scenario === 'invalid'">
    <UiField
      :field="amount"
      label="Amount (USD)"
    >
      <UiTextInput />
    </UiField>
    <UiField
      :field="reference"
      label="Reference"
    >
      <UiTextInput />
    </UiField>
  </template>
  <template v-else>
    <button
      type="button"
      @click="size = 0"
    >
      Default size
    </button>
    <button
      type="button"
      @click="size = -1"
    >
      Small size
    </button>
    <button
      type="button"
      @click="size = 1"
    >
      Large size
    </button>
    <UiStrategy :use="uiControlSize(size)">
      <UiField
        :field="reference"
        label="Reference"
      >
        <UiInputFrame><UiTextInput /></UiInputFrame>
      </UiField>
      <UiField
        :field="ordinary"
        label="Ordinary input"
      >
        <UiTextInput />
      </UiField>
    </UiStrategy>
  </template>
</template>
