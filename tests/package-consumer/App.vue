<script setup lang="ts">
  import { ref } from 'vue'
  import { UiApp, UiButton, UiContent } from '@uninterface/uninterface'

  const acknowledged = ref(false)
</script>

<template>
  <UiApp>
    <UiContent>
      <h1>Application ready</h1>
      <UiButton
        :disabled="acknowledged"
        @click="acknowledged = true"
      >
        Acknowledge
      </UiButton>
      <p
        v-if="acknowledged"
        role="status"
      >
        Acknowledged.
      </p>
    </UiContent>
  </UiApp>
</template>
