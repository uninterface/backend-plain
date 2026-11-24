<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { mergeProps } from 'vue'
  import {
    useUiTabList,
    type UiTabsViewProps,
  } from '@uninterface/uninterface/backend'
  import { uiFocusPresentation } from './focus'
  const props = defineProps<UiTabsViewProps>()
  const emit = defineEmits<{ select: [key: string] }>()
  const { setElement, tabIndex, focus, keydown } = useUiTabList(props)
</script>
<template>
  <div
    class="plain-tabs"
    :data-orientation="orientation"
  >
    <div
      role="tablist"
      :aria-label="label"
      :aria-orientation="orientation"
      class="plain-tab-list"
    >
      <button
        v-for="item in items"
        :key="item.key"
        :ref="(element) => setElement(item.key, element)"
        v-bind="mergeProps({ ...uiFocusPresentation }, item.attributes)"
        type="button"
        role="tab"
        :id="item.tabId"
        class="plain-tab"
        :class="{ 'is-selected': item.selected }"
        :aria-selected="item.selected"
        :aria-controls="item.panelId"
        :disabled="item.disabled"
        :tabindex="tabIndex(item.key)"
        @focus="focus(item.key)"
        @keydown="keydown($event, item.key)"
        @click="emit('select', item.key)"
      >
        <slot :item="item" />
      </button>
    </div>
  </div>
</template>
