<script setup lang="ts">
  import type { UiDrawerEdge } from '@uninterface/uninterface'
  defineProps<{ edge: UiDrawerEdge }>()
</script>
<template>
  <span
    class="plain-drawer-depth"
    :data-edge="edge"
    aria-hidden="true"
  >
    <span class="plain-drawer-depth-shadow" />
  </span>
</template>
