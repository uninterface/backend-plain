<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { useUiZPopup, useUiMenuPoint } from '@uninterface/uninterface/backend'

  import { uiFocusPresentation } from './focus'
  import {
    nextTick,
    computed,
    useId,
    onBeforeUnmount,
    onMounted,
    onActivated,
    onDeactivated,
    onBeforeUpdate,
    onUpdated,
    ref,
    watch,
  } from 'vue'
  import type {
    UiMenuViewBinding,
    UiMenuHostBindings,
  } from '@uninterface/uninterface/backend'
  import EntryBranch from './EntryBranch.vue'
  const props = defineProps<{ binding: UiMenuViewBinding }>()
  const emit = defineEmits<{
    open: []
    close: []
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  const host = ref<HTMLElement>()
  const surface = ref<HTMLElement>()
  const id = useId()
  let anchor: HTMLElement | undefined
  let disposed = false
  let openingRevision = 0
  let keyboardContextPending = false
  const point = ref<{ x: number; y: number }>()
  const effectivePoint = useUiMenuPoint(
    () =>
      props.binding.open && props.binding.mode !== 'inline'
        ? point.value
        : undefined,
    () => anchor,
  )
  watch(effectivePoint, () => place(), { flush: 'post' })
  const position = ref({ left: '0px', top: '0px' })
  let returnTo: HTMLElement | null = null
  let hadFocus = false
  let typeahead = ''
  let typedAt = 0
  function first(root = surface.value) {
    return (
      root?.querySelector<HTMLElement>('[role^="menuitem"]') ??
      root?.querySelector<HTMLElement>('[role="menu"]')
    )
  }
  function place() {
    if (!surface.value || props.binding.mode === 'inline') return
    const bounds = anchor?.getBoundingClientRect()
    const box = surface.value.getBoundingClientRect()
    const rtl = anchor && getComputedStyle(anchor).direction === 'rtl'
    const x =
      effectivePoint.value?.x ??
      (rtl ? (bounds?.right ?? 0) - box.width : (bounds?.left ?? 0))
    let y = effectivePoint.value?.y ?? bounds?.bottom ?? 0
    if (
      !point.value &&
      bounds &&
      y + box.height > window.innerHeight &&
      bounds.top >= box.height
    )
      y = bounds.top - box.height
    const next = {
      left: `${Math.max(0, Math.min(x, window.innerWidth - box.width))}px`,
      top: `${Math.max(0, Math.min(y, window.innerHeight - box.height))}px`,
    }
    if (next.left !== position.value.left || next.top !== position.value.top)
      position.value = next
  }
  function open(event: MouseEvent | KeyboardEvent, atPointer = false) {
    const target = event.currentTarget
    if (!(target instanceof HTMLElement))
      throw new Error(
        'Menu host bindings require a rendered HTMLElement event target.',
      )
    anchor = target
    returnTo = target
    point.value =
      atPointer && event instanceof MouseEvent
        ? { x: event.clientX, y: event.clientY }
        : undefined
    emit('open')
    if (props.binding.open) {
      place()
      first()?.focus()
    }
  }
  const hostBindings = computed<UiMenuHostBindings>(() => {
    const state = {
      'aria-haspopup': 'menu' as const,
      'aria-expanded': props.binding.open,
      'aria-controls': props.binding.open ? id : undefined,
    }
    return {
      buttonTrigger: {
        ...state,
        onClick: (event) => (props.binding.open ? close() : open(event)),
      },
      contextTrigger: {
        ...uiFocusPresentation,
        'aria-haspopup': state['aria-haspopup'],
        'aria-controls': state['aria-controls'],
        role: 'group',
        tabindex: 0,
        'aria-label': props.binding.label,
        onContextmenu(event) {
          event.preventDefault()
          open(event, true)
        },
        onKeydown(event) {
          if (
            event.key === 'ContextMenu' ||
            (event.shiftKey && event.key === 'F10')
          ) {
            event.preventDefault()
            event.stopPropagation()
            keyboardContextPending = true
            open(event)
          }
        },
      },
    }
  })
  // Some browsers dispatch contextmenu after focus has moved into a teleported
  // popup. Cancel only the follow-up to our consumed keyboard invocation.
  // Keyup must not disarm this: the native event can be a key-release action.
  function resetKeyboardContext() {
    keyboardContextPending = false
  }
  function keyboardContext(event: MouseEvent) {
    if (!keyboardContextPending || !props.binding.open) return
    const target = event.target as Node | null
    if (
      !target ||
      (!anchor?.contains(target) && !surface.value?.contains(target))
    )
      return
    keyboardContextPending = false
    event.preventDefault()
    event.stopPropagation()
  }
  function listenContext() {
    document.addEventListener('contextmenu', keyboardContext, true)
    document.addEventListener('keydown', resetKeyboardContext, true)
    document.addEventListener('pointerdown', resetKeyboardContext, true)
  }
  function unlistenContext() {
    resetKeyboardContext()
    document.removeEventListener('contextmenu', keyboardContext, true)
    document.removeEventListener('keydown', resetKeyboardContext, true)
    document.removeEventListener('pointerdown', resetKeyboardContext, true)
  }
  onMounted(listenContext)
  onActivated(listenContext)
  onDeactivated(unlistenContext)
  onBeforeUnmount(unlistenContext)
  function close(restore = true) {
    keyboardContextPending = false
    emit('close')
    if (restore) (returnTo?.isConnected ? returnTo : anchor)?.focus()
  }
  function outside(event: Event) {
    if (
      !host.value?.contains(event.target as Node) &&
      !surface.value?.contains(event.target as Node)
    )
      close(false)
  }
  async function keyboard(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if (!surface.value?.contains(target)) return
    const menu = target.closest<HTMLElement>('[role="menu"]')
    if (!menu) return
    const items = [
      ...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
    ].filter((item) => item.closest('[role="menu"]') === menu)
    const index = items.indexOf(
      target.closest<HTMLElement>('[role^="menuitem"]')!,
    )
    const rtl = getComputedStyle(menu).direction === 'rtl'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft'
    let destination: HTMLElement | undefined
    if (event.key === 'ArrowDown')
      destination = items[(index + 1) % items.length]
    else if (event.key === 'ArrowUp')
      destination = items[(index - 1 + items.length) % items.length]
    else if (event.key === 'Home') destination = items[0]
    else if (event.key === 'End') destination = items.at(-1)
    else if (
      event.key === forward &&
      target.hasAttribute('aria-expanded') &&
      target.getAttribute('aria-disabled') !== 'true'
    ) {
      event.preventDefault()
      event.stopPropagation()
      emit('expand', target.dataset.entryKey!, true)
      await nextTick()
      const child =
        target.parentElement?.querySelector<HTMLElement>('[role="menu"]')
      ;(
        child?.querySelector<HTMLElement>('[role^="menuitem"]') ?? child
      )?.focus()
    } else if (
      (event.key === backward || event.key === 'Escape') &&
      menu.dataset.parent !== undefined
    ) {
      const key = menu.dataset.parent
      const parent = [
        ...surface.value.querySelectorAll<HTMLElement>('[data-entry-key]'),
      ].find((item) => item.dataset.entryKey === key)
      emit('expand', key, false)
      parent?.focus()
    } else if (event.key === 'Escape' && props.binding.mode !== 'inline')
      close()
    else if (event.key === 'Tab') {
      if (props.binding.mode !== 'inline') close()
      return
    } else if (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      typeahead = Date.now() - typedAt > 600 ? event.key : typeahead + event.key
      typedAt = Date.now()
      const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
      destination = ordered.find((item) =>
        (item.getAttribute('aria-label') ?? item.textContent ?? '')
          .toLocaleLowerCase()
          .startsWith(typeahead.toLocaleLowerCase()),
      )
    } else return
    event.preventDefault()
    event.stopPropagation()
    destination?.focus()
  }
  watch(
    [() => props.binding.mode, () => props.binding.open],
    async ([mode, open]) => {
      const revision = ++openingRevision
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
      if (mode === 'inline' || !open) resetKeyboardContext()
      if (mode === 'inline') {
        if (surface.value?.hasAttribute('popover'))
          surface.value.hidePopover?.()
        zPopup.closed()
        return
      }
      if (!open) {
        surface.value?.hidePopover?.()
        zPopup.closed()
        return
      }
      await nextTick()
      if (disposed || revision !== openingRevision || !props.binding.open)
        return
      if (!surface.value?.showPopover)
        throw new Error('Menu popups require browser Popover API support.')
      zPopup.prepare(surface.value)
      try {
        surface.value.showPopover()
      } catch (error) {
        zPopup.closed()
        throw error
      }
      place()
      first()?.focus()
      document.addEventListener('pointerdown', outside)
      document.addEventListener('focusin', outside)
      window.addEventListener('resize', place)
      window.addEventListener('scroll', place, true)
    },
  )
  onBeforeUpdate(() => {
    hadFocus = Boolean(surface.value?.contains(document.activeElement))
  })
  onUpdated(() => {
    place()
    if (
      hadFocus &&
      document.activeElement === document.body &&
      !surface.value?.querySelector('[popover=manual]')
    )
      first()?.focus()
  })
  onDeactivated(() => {
    openingRevision++
    if (props.binding.mode !== 'inline' && surface.value?.isConnected)
      surface.value.hidePopover?.()
    zPopup.closed()
    document.removeEventListener('pointerdown', outside)
    document.removeEventListener('focusin', outside)
    window.removeEventListener('resize', place)
    window.removeEventListener('scroll', place, true)
  })
  onBeforeUnmount(() => {
    disposed = true
    if (props.binding.mode === 'popup' && surface.value?.isConnected)
      surface.value.hidePopover?.()
    zPopup.closed()
    openingRevision++
    document.removeEventListener('pointerdown', outside)
    document.removeEventListener('focusin', outside)
    window.removeEventListener('resize', place)
    window.removeEventListener('scroll', place, true)
  })
  async function expanded(key: string, open: boolean) {
    emit('expand', key, open)
    if (!open) return
    await nextTick()
    const child = [
      ...(surface.value?.querySelectorAll<HTMLElement>('[role=menu]') ?? []),
    ].find((node) => node.dataset.parent === key)
    ;(child?.querySelector<HTMLElement>('[role^=menuitem]') ?? child)?.focus()
  }
  function activated(key: string) {
    emit('activate', key)
    nextTick(() => {
      if (!props.binding.open)
        (returnTo?.isConnected ? returnTo : anchor)?.focus()
    })
  }
  const zPopup = useUiZPopup(
    () => (props.binding.mode === 'popup' ? surface.value : undefined),
    { topLayer: true, scope: true, source: 'menu popup' },
  )
</script>
<template>
  <div
    ref="host"
    class="plain-entry-host"
  >
    <slot
      v-if="binding.mode === 'popup'"
      name="host"
      v-bind="hostBindings"
    />

    <div
      v-if="binding.open"
      ref="surface"
      :popover="binding.mode !== 'inline' ? 'manual' : undefined"
      class="plain-entry-surface"
      :class="{ 'plain-entry-popup': binding.mode !== 'inline' }"
      :style="binding.mode !== 'inline' ? position : undefined"
      @keydown="keyboard"
      @focusin="
        (event: FocusEvent) => {
          const item = event.target as HTMLElement
          if (item.matches('[role^=menuitem]')) {
            surface
              ?.querySelectorAll('[role^=menuitem]')
              .forEach((node) => node.setAttribute('tabindex', '-1'))
            surface
              ?.querySelector('[role=menu]')
              ?.setAttribute('tabindex', '-1')
            item.tabIndex = 0
          }
        }
      "
    >
      <EntryBranch
        :id="id"
        :entries="binding.entries"
        :status="binding.status"
        :label="binding.label"
        :tabindex="binding.mode === 'inline' ? 0 : -1"
        @focus="
          (event: FocusEvent) => {
            if (event.target === event.currentTarget) first()?.focus()
          }
        "
        @activate="activated"
        @expand="expanded"
        @retry="$emit('retry', $event)"
      >
        <template #entry="scope">
          <slot
            name="entry"
            v-bind="scope"
          />
        </template>
        <template #icon="scope">
          <slot
            name="icon"
            v-bind="scope"
          />
        </template>
      </EntryBranch>
    </div>
  </div>
</template>
