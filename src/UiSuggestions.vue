<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiSuggestionsView,
    useUiOverlayTarget,
    type UiSuggestionsViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiSuggestionsViewProps>()
  const { anchor, anchorWidth, surface, visible, host, active, accept } =
    useUiSuggestionsView(props)
  const portal = useUiOverlayTarget()
  import { useUiTooltipPosition } from '@uninterface/uninterface/backend'
  useUiTooltipPosition(
    anchor,
    surface,
    () => 'bottom',
    () => visible.value,
  )
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  useUiZPopup(() => surface.value, { source: 'UiSuggestions' })
</script>
<template>
  <slot
    name="host"
    :host="host"
  />
  <Teleport :to="portal ?? 'body'">
    <div v-if="visible">
      <div
        ref="surface"
        class="plain-suggestions"
        :style="{
          width: anchorWidth === undefined ? undefined : `${anchorWidth}px`,
        }"
      >
        <ul
          :id="id"
          role="listbox"
          :aria-busy="pending || undefined"
          :aria-label="label"
        >
          <li
            v-for="(item, index) in results"
            :id="`${id}-${index}`"
            :key="item.key"
            role="option"
            :aria-label="item.label"
            :aria-selected="active === index"
            :aria-disabled="item.disabled || undefined"
            @mousedown.prevent
            @click="accept(index)"
          >
            <slot
              name="suggestion"
              :item="item"
              :active="active === index"
            >
              {{ item.label }}
            </slot>
          </li>
        </ul>
        <div
          v-if="message"
          class="plain-suggestions-status"
          :class="{ 'plain-suggestions-status-update': results.length > 0 }"
          role="status"
        >
          {{ message }}
        </div>
      </div>
    </div>
  </Teleport>
</template>
