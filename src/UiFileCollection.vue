<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiFileCollectionViewProps } from '@uninterface/uninterface/backend'

  defineProps<UiFileCollectionViewProps>()
</script>
<template>
  <ul class="plain-file-collection">
    <li
      v-for="file in files"
      :key="file.key"
    >
      <slot :file="file" />
      <button
        v-if="removable"
        type="button"
        :disabled="disabled"
        :aria-label="`${removeLabel}: ${file.name}`"
        @click="remove(file.key)"
      >
        {{ removeLabel }}
      </button>
    </li>
  </ul>
</template>
