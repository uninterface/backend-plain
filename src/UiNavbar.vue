<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
</script>
<template>
  <nav class="plain-navbar">
    <div
      v-if="$slots.brand"
      class="plain-navbar-brand"
    >
      <slot name="brand" />
    </div>
    <div
      v-if="$slots.default"
      class="plain-navbar-links"
    >
      <slot />
    </div>
    <div
      v-if="$slots.actions"
      class="plain-navbar-actions"
    >
      <slot name="actions" />
    </div>
  </nav>
</template>
