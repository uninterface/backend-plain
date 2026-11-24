<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiUploadRegionView,
    type UiUploadRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import Preview from './UiFilePreview.vue'
  import Progress from './UiUploadProgress.vue'
  import UploadIcon from './icons/upload.vue'

  import RemoveIcon from './icons/delete.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiUploadRegionViewProps>()
  const {
    root,
    input,
    dragging,
    labelled,
    choose,
    changed,
    dragover,
    dragleave,
    drop,
    focus,
  } = useUiUploadRegionView(props)
  defineExpose({ focus })
</script>
<template>
  <div
    ref="root"
    v-bind="$attrs"
    role="group"
    :aria-label="label || chooseLabel"
    :aria-busy="busy || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-describedby="labelled['aria-describedby']"
    :tabindex="binding.disabled ? undefined : -1"
    data-ui-upload-region
    :data-upload-phase="phase"
    :data-upload-error="!!issue || undefined"
    :data-upload-recovery="!!issue || !!progress?.canRetry || undefined"
    class="plain-upload-region"
    :data-extent="extent"
    :style="
      allocatedHeight === undefined
        ? undefined
        : { blockSize: allocatedHeight + 'px' }
    "
    :data-drop-ready="canAcquire || undefined"
    :data-dragging="(dragging && canAcquire) || undefined"
    :data-invalid="binding.invalid || !!issue || undefined"
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
  >
    <span
      v-if="requiredLabel"
      :id="binding.id + '-upload-required'"
      class="upload-required-description"
    >
      {{ requiredLabel }}
    </span>
    <input
      ref="input"
      type="file"
      hidden
      :accept="accept"
      :capture="capture"
      :disabled="!canAcquire"
      @change="changed"
    />
    <button
      v-bind="labelled"
      type="button"
      class="plain-button"
      data-upload-choose
      :title="chooseLabel"
      v-if="phase === 'ready'"
      :disabled="!canAcquire"
      @click="choose"
    >
      <UploadIcon
        v-if="issue || progress?.canRetry"
        aria-hidden="true"
        class="plain-upload-recovery-icon"
      />
      <span v-else>{{ chooseLabel }}</span>
    </button>
    <span
      v-if="
        fileName &&
        !preview &&
        !(
          progress?.fileName &&
          (progress.active || progress.issue || progress.canRetry)
        )
      "
      data-ui-file-name
      :title="fileName ?? undefined"
      class="plain-upload-name"
    >
      {{ fileName }}
    </span>
    <div
      v-if="!progress?.issue"
      :id="binding.id + '-upload-issue'"
      role="status"
      class="plain-upload-feedback"
      :title="issue ?? undefined"
    >
      {{ issue }}
    </div>
    <Progress
      v-if="progress"
      v-bind="progress"
    />
    <div
      v-if="preview"
      data-upload-preview
      class="plain-upload-preview"
    >
      <Preview
        v-bind="preview"
        :presentation="issue ? 'row' : preview.presentation"
      />
    </div>
    <div
      v-if="actions.length"
      class="plain-upload-actions"
    >
      <button
        v-for="action in actions"
        :key="action.name"
        type="button"
        class="plain-button"
        :class="{ 'plain-variant-icon': action.name === 'remove' }"
        :data-upload-action="action.name"
        :aria-label="
          action.accessibleLabel ??
          (action.name === 'remove' ? action.label : undefined)
        "
        :title="action.name === 'remove' ? action.label : undefined"
        :disabled="action.disabled"
        @click="action.invoke"
      >
        <RemoveIcon
          v-if="action.name === 'remove'"
          aria-hidden="true"
          class="upload-remove-icon"
        />
        <template v-if="action.name !== 'remove'">{{ action.label }}</template>
      </button>
    </div>
  </div>
</template>
