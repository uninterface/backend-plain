<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import {
    useUiCollectionFooterNavigation,
    useUiCollectionFooterCompact,
  } from '@uninterface/uninterface/backend'
  const footerCompact = useUiCollectionFooterCompact()

  import { computed } from 'vue'
  import type { UiPaginatorViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiPaginatorViewProps>()
  const footerWidth = useUiCollectionFooterNavigation(
    () => 24 + Math.min(props.pageCount ?? 1, 7) * 3,
    () => 13 + String(props.page ?? 1).length * 0.65,
  )
  const compact = computed(() => footerCompact?.value ?? false)
  const numbered = computed(
    () =>
      props.page !== undefined &&
      props.pageCount !== undefined &&
      props.pageCount > 0 &&
      props.page <= props.pageCount &&
      props.canJump,
  )
  // Keep a bounded set of page buttons even for very large totals.
  const pages = computed(() => {
    if (!numbered.value) return []
    if (compact.value) {
      const count = props.pageCount!,
        current = props.page!
      const visible = (footerWidth?.value ?? 0) >= 360 ? Math.min(3, count) : 1
      const start = Math.max(
        1,
        Math.min(current - Math.floor(visible / 2), count - visible + 1),
      )
      return Array.from({ length: visible }, (_, index) => start + index)
    }
    const count = props.pageCount!,
      current = props.page!
    const visible = new Set([1, count])
    const start =
      count <= 7
        ? 1
        : current <= 4
          ? 1
          : current >= count - 3
            ? count - 4
            : current - 1
    const end =
      count <= 7
        ? count
        : current <= 4
          ? 5
          : current >= count - 3
            ? count
            : current + 1
    for (let page = start; page <= end; page++) visible.add(page)
    const result: (number | string)[] = []
    let previous = 0
    for (const page of [...visible].sort((a, b) => a - b)) {
      if (page - previous > 1) result.push(`gap-${page}`)
      result.push(page)
      previous = page
    }
    return result
  })
</script>
<template>
  <nav
    class="plain-paginator"
    :data-compact="compact ? '' : undefined"
    :aria-label="label"
    :aria-busy="pending"
  >
    <button
      class="plain-button plain-color-secondary"
      type="button"
      :disabled="!canFirst"
      :aria-label="firstLabel"
      @click="first"
    >
      <span
        v-if="compact"
        class="plain-paginator-direction"
        aria-hidden="true"
      >
        «
      </span>
      <template v-else>{{ firstLabel }}</template>
    </button>
    <button
      class="plain-button plain-color-secondary"
      type="button"
      :disabled="!canPrevious"
      :aria-label="previousLabel"
      @click="previous"
    >
      <span
        v-if="compact"
        class="plain-paginator-direction"
        aria-hidden="true"
      >
        ‹
      </span>
      <template v-else>{{ previousLabel }}</template>
    </button>
    <template
      v-for="item in pages"
      :key="item"
    >
      <button
        class="plain-button plain-color-secondary"
        v-if="typeof item === 'number'"
        type="button"
        :aria-label="pageName(item)"
        :aria-current="item === page ? 'page' : undefined"
        :disabled="pending"
        @click="goTo(item)"
      >
        {{ item }}
      </button>
      <span
        v-else
        aria-hidden="true"
      >
        …
      </span>
    </template>
    <span v-if="!numbered && pageLabel">{{ compact ? page : pageLabel }}</span>
    <button
      class="plain-button plain-color-secondary"
      type="button"
      :disabled="!canNext"
      :aria-label="nextLabel"
      @click="next"
    >
      <span
        v-if="compact"
        class="plain-paginator-direction"
        aria-hidden="true"
      >
        ›
      </span>
      <template v-else>{{ nextLabel }}</template>
    </button>
    <button
      class="plain-button plain-color-secondary"
      type="button"
      :disabled="!canLast"
      :aria-label="lastLabel"
      @click="last"
    >
      <span
        v-if="compact"
        class="plain-paginator-direction"
        aria-hidden="true"
      >
        »
      </span>
      <template v-else>{{ lastLabel }}</template>
    </button>
  </nav>
</template>
