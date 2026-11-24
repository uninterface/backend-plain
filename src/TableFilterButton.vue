<script setup lang="ts">
  import FilterIcon from './icons/filter.vue'
  defineProps<{ active: boolean; disabled: boolean }>()
</script>
<template>
  <button
    type="button"
    class="plain-table-filter"
    :disabled="disabled"
    :data-filter-active="active || undefined"
  >
    <span aria-hidden="true"><FilterIcon class="table-filter-icon" /></span>
  </button>
</template>
