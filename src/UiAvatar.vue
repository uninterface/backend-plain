<script setup lang="ts">
  import {
    uiAvatarImageProps,
    useUiZView,
    type UiAvatarViewProps,
  } from '@uninterface/uninterface/backend'
  defineProps<UiAvatarViewProps>()
  useUiZView()

  const sizeOffsets = {
    '-2': '-1rem',
    '-1': '-0.5rem',
    '0': '0px',
    '1': '0.5rem',
    '2': '1rem',
  } as const
</script>

<template>
  <span
    class="plain-avatar"
    :class="{ 'plain-avatar--square': shape === 'square' }"
    :style="{
      width: size,
      height: size,
      '--plain-avatar-size-offset': sizeOffsets[sizeStep],
    }"
  >
    <img
      v-if="image"
      :key="image.key"
      v-show="image.visible"
      class="plain-avatar-image"
      v-bind="uiAvatarImageProps(image)"
      :style="{ objectFit: fit }"
      alt=""
    />
    <span
      v-if="!image?.visible"
      class="plain-avatar-fallback"
      aria-hidden="true"
    >
      <slot name="fallback">
        <svg
          class="plain-avatar-glyph"
          viewBox="0 0 24 24"
          fill="currentColor"
          focusable="false"
        >
          <path
            d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 10c4 0 8 2 8 4v2H4v-2c0-2 4-4 8-4Z"
          />
        </svg>
      </slot>
    </span>
  </span>
</template>

<style scoped>
  .plain-avatar {
    --plain-avatar-fallback-scale: 0.875;
    --plain-avatar-diameter: calc(
      3.25em * var(--plain-avatar-fallback-scale) +
        var(--plain-avatar-size-offset)
    );
    width: var(--plain-avatar-diameter);
    height: var(--plain-avatar-diameter);
    position: relative;
    display: inline-flex;
    flex: none;
    overflow: hidden;
    vertical-align: middle;
    border-radius: 50%;
    color: var(--plain-text);
    background: color-mix(in srgb, var(--plain-text) 9%, var(--plain-surface));
  }
  .plain-avatar--square {
    border-radius: 0.25rem;
  }
  .plain-avatar-fallback {
    font-size: calc(1em * var(--plain-avatar-fallback-scale));
    font-weight: 600;
  }
  .plain-avatar-image,
  .plain-avatar-fallback {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .plain-avatar-fallback {
    display: grid;
    place-items: center;
    line-height: 1;
  }

  .plain-avatar-glyph {
    width: 1em;
    height: 1em;
  }
</style>
