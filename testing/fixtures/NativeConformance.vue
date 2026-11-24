<script setup lang="ts">
  import { onScopeDispose } from 'vue'
  import {
    UiField,
    UiNavbar,
    UiSegmentedSelect,
    UiSelect,
    UiStrategy,
    createUiEntryControl,
    createUiFieldControl,
    uiFieldLabels,
  } from '@uninterface/uninterface'

  const choice = createUiFieldControl('one')
  const entries = createUiEntryControl([
    { key: 'one', label: 'First' },
    { key: 'two', label: 'Second' },
    { key: 'three', label: 'Third' },
  ])
  onScopeDispose(entries.dispose)
</script>

<template>
  <UiStrategy :use="uiFieldLabels('above')">
    <UiNavbar aria-label="Field alignment">
      <template #actions>
        <UiField
          :field="choice"
          label="Selection"
        >
          <UiSelect :control="entries" />
        </UiField>
        <UiField
          :field="choice"
          label="Choices"
        >
          <UiSegmentedSelect :control="entries" />
        </UiField>
      </template>
    </UiNavbar>
  </UiStrategy>
</template>
