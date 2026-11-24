<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { useUiZPart } from '@uninterface/uninterface/backend'
  const vUiZPart = useUiZPart()

  import type { UiBreadcrumbsViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiBreadcrumbsViewProps>()
</script>
<template>
  <nav :aria-label="label">
    <ol class="plain-breadcrumbs">
      <li
        v-for="item in items"
        :key="item.key"
        v-ui-z-part="item.z"
      >
        <component
          :is="
            item.href === undefined
              ? item.actionable
                ? 'button'
                : 'span'
              : 'a'
          "
          v-bind="item.attributes"
          :href="item.href"
          :type="
            item.actionable && item.href === undefined ? 'button' : undefined
          "
          :class="{ 'plain-link': item.href !== undefined }"
          :aria-current="item.current ? 'page' : undefined"
          :aria-disabled="item.disabled || undefined"
        >
          <slot :item="item" />
        </component>
      </li>
    </ol>
    <div
      v-if="status?.message"
      role="status"
      :aria-busy="status.pending || undefined"
    >
      {{ status.message }}
      <button
        type="button"
        class="plain-button"
        v-if="status.failed"
        @click="retry?.()"
      >
        {{ status.retryLabel }}
      </button>
    </div>
  </nav>
</template>
