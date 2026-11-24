<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { nextTick, onMounted, onBeforeUnmount, onDeactivated, ref } from 'vue'
  const props = defineProps<{
    anchor?: HTMLElement
    side?: boolean
    navigation?: boolean
  }>()
  const emit = defineEmits<{ close: [] }>()
  const surface = ref<HTMLElement>()
  const zPopup = useUiZPopup(() => surface.value, {
    topLayer: true,
    scope: true,
    source: 'submenu',
  })
  const position = ref({ left: '0px', top: '0px' })
  let observer: ResizeObserver | undefined
  let active = false
  function place() {
    if (!active || !surface.value || !props.anchor) return
    const anchor = props.anchor.getBoundingClientRect()
    const box = surface.value.getBoundingClientRect()
    const rtl = getComputedStyle(props.anchor).direction === 'rtl'
    let x = props.side
      ? rtl
        ? anchor.left - box.width
        : anchor.right
      : rtl
        ? anchor.right - box.width
        : anchor.left
    let y = props.side ? anchor.top : anchor.bottom
    if (props.side && (x < 0 || x + box.width > window.innerWidth))
      x = rtl ? anchor.right : anchor.left - box.width
    if (
      !props.side &&
      y + box.height > window.innerHeight &&
      anchor.top >= box.height
    )
      y = anchor.top - box.height
    const next = {
      left: `${Math.max(0, Math.min(x, window.innerWidth - box.width))}px`,
      top: `${Math.max(0, Math.min(y, window.innerHeight - box.height))}px`,
    }
    if (next.left !== position.value.left || next.top !== position.value.top)
      position.value = next
  }
  function outside(event: Event) {
    if (
      !surface.value?.contains(event.target as Node) &&
      !props.anchor?.contains(event.target as Node)
    )
      emit('close')
  }
  function keyboard(event: KeyboardEvent) {
    if (!props.navigation) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      emit('close')
      props.anchor?.focus()
    }
  }
  function cleanup() {
    active = false
    zPopup.closed()
    if (surface.value?.isConnected) surface.value.hidePopover?.()
    observer?.disconnect()
    document.removeEventListener('pointerdown', outside)
    document.removeEventListener('focusin', outside)
    window.removeEventListener('resize', place)
    window.removeEventListener('scroll', place, true)
  }
  onMounted(async () => {
    if (!props.anchor)
      throw new Error('A submenu requires its rendered trigger as anchor.')
    if (!surface.value?.showPopover)
      throw new Error('Menu popups require browser Popover API support.')
    active = true
    zPopup.prepare(surface.value)
    try {
      surface.value.showPopover()
    } catch (error) {
      zPopup.closed()
      throw error
    }
    place()
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(place)
      observer.observe(surface.value)
      observer.observe(props.anchor)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    await nextTick()
    if (active)
      (
        surface.value?.querySelector<HTMLElement>(
          '[role^="menuitem"], a[href], button:not([disabled])',
        ) ??
        surface.value?.querySelector<HTMLElement>('[role="menu"]') ??
        surface.value
      )?.focus()
  })
  onBeforeUnmount(cleanup)
  onDeactivated(cleanup)
</script>
<template>
  <div
    ref="surface"
    popover="manual"
    tabindex="-1"
    class="plain-entry-popup"
    :style="position"
    @keydown="keyboard"
  >
    <slot />
  </div>
</template>
