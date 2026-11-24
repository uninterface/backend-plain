<script setup lang="ts">
  import { useId, computed } from 'vue'
  import EntryPopup from './EntryPopup.vue'
  import { useUiMenuIconColumn } from '@uninterface/uninterface/backend'
  import type {
    UiEntryViewNode,
    UiEntryStatusViewBinding,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<{
    entries: readonly UiEntryViewNode[]
    status?: UiEntryStatusViewBinding
    label: string
    navigation?: boolean
    group?: boolean
    presentation?: import('@uninterface/uninterface').UiNavMenuPresentation
    parentKey?: string
  }>()
  const emit = defineEmits<{
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  defineSlots<{
    entry(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
    }): any
    icon(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
      icon?: unknown
    }): any
  }>()
  const tree = computed(
    () => props.navigation && props.presentation === 'vertical-tree',
  )
  const rail = computed(
    () =>
      props.navigation &&
      props.parentKey === undefined &&
      props.presentation === 'icon-popup',
  )
  const iconColumn = useUiMenuIconColumn(() => props.entries, {
    group: () => Boolean(props.group),
    reserve: () =>
      Boolean(
        props.navigation &&
          (props.presentation === 'vertical-tree' ||
            (props.parentKey === undefined &&
              props.presentation !== 'horizontal')),
      ),
    enabled: () =>
      !(
        props.navigation &&
        props.parentKey === undefined &&
        (!props.presentation || props.presentation === 'horizontal')
      ),
  })
  const id = useId()
  const anchors = new Map<string, HTMLElement>()
  function retry(event: MouseEvent) {
    const button = event.currentTarget as HTMLButtonElement
    // Loading removes Retry. Keep its keyboard position in the open branch.
    if (document.activeElement === button)
      button.closest<HTMLElement>('[role="menu"]')?.focus()
    emit('retry', props.parentKey)
  }
</script>
<template>
  <ul
    class="plain-entry-list"
    :class="{
      'plain-navigation-tree': tree,
      'plain-navigation-rail': rail,
      'plain-navigation-vertical': navigation && presentation !== 'horizontal',
    }"
    :role="navigation ? undefined : group ? 'group' : 'menu'"
    :aria-label="label"
    :aria-busy="status?.pending || undefined"
    :data-parent="parentKey"
    :tabindex="!navigation && !group ? -1 : undefined"
  >
    <li
      v-for="(node, index) in entries"
      :key="node.entry.key"
      :role="navigation ? undefined : 'none'"
    >
      <hr
        v-if="node.entry.kind === 'separator'"
        class="plain-entry-separator"
      />
      <template v-else-if="node.entry.kind === 'group'">
        <div
          :id="`${id}-${index}`"
          class="plain-entry-group-label"
          :data-rail-heading="rail || undefined"
        >
          <span
            v-if="node.entry.icon || iconColumn"
            aria-hidden="true"
            class="plain-entry-icon"
          >
            <slot
              v-if="node.entry.icon"
              name="icon"
              :entry="node.entry"
              :icon="node.entry.icon"
            />
          </span>
          <slot
            name="entry"
            :entry="node.entry"
          >
            {{ node.entry.label }}
          </slot>
        </div>
        <small v-if="node.entry.description">
          {{ node.entry.description }}
        </small>
        <EntryBranch
          :entries="node.children ?? []"
          :label="node.entry.label"
          :aria-labelledby="`${id}-${index}`"
          :navigation="navigation"
          :presentation="presentation"
          :parent-key="parentKey"
          group
          @activate="$emit('activate', $event)"
          @expand="(key, open) => $emit('expand', key, open)"
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
      </template>
      <template v-else>
        <component
          :ref="
            (element: any) => {
              if (element) anchors.set(node.entry.key, element)
              else anchors.delete(node.entry.key)
            }
          "
          :is="
            navigation && node.entry.kind !== 'submenu' && node.entry.href
              ? 'a'
              : 'button'
          "
          class="plain-entry-item"
          :data-navigation-row="
            navigation && (parentKey === undefined || tree)
              ? rail
                ? 'rail'
                : 'labelled'
              : undefined
          "
          :type="
            navigation && node.entry.kind !== 'submenu' && node.entry.href
              ? undefined
              : 'button'
          "
          :role="
            navigation
              ? node.entry.kind !== 'submenu' &&
                node.entry.href &&
                node.entry.disabled
                ? 'link'
                : undefined
              : node.selectionMode === 'multiple'
                ? 'menuitemcheckbox'
                : node.selectionMode === 'single'
                  ? 'menuitemradio'
                  : 'menuitem'
          "
          :href="
            navigation && node.entry.kind !== 'submenu' && !node.entry.disabled
              ? node.entry.href
              : undefined
          "
          :tabindex="navigation ? (node.entry.disabled ? -1 : undefined) : -1"
          :data-entry-key="node.entry.key"
          :aria-disabled="node.entry.disabled || undefined"
          :data-current-ancestor="node.containsCurrent || undefined"
          :aria-current="node.current ? 'page' : undefined"
          :aria-checked="
            node.selectionMode ? Boolean(node.selected) : undefined
          "
          :aria-haspopup="
            !navigation && node.entry.kind === 'submenu' ? 'menu' : undefined
          "
          :aria-expanded="
            node.entry.kind === 'submenu' ? Boolean(node.expanded) : undefined
          "
          :aria-controls="
            node.entry.kind === 'submenu' && node.expanded
              ? `${id}-sub-${index}`
              : undefined
          "
          :aria-label="node.entry.label"
          :aria-describedby="
            node.entry.description ? `${id}-description-${index}` : undefined
          "
          @click="
            (event: MouseEvent) => {
              if ('disabled' in node.entry && node.entry.disabled) {
                event.preventDefault()
                return
              }
              if (
                navigation &&
                'href' in node.entry &&
                node.entry.href &&
                (event.ctrlKey ||
                  event.metaKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0)
              )
                return
              if (node.entry.kind === 'submenu')
                $emit('expand', node.entry.key, !node.expanded)
              else if (node.request) node.request(event)
              else $emit('activate', node.entry.key)
            }
          "
        >
          <span
            v-if="node.selectionMode"
            aria-hidden="true"
            class="plain-entry-check"
          >
            {{
              node.selected ? (node.selectionMode === 'single' ? '●' : '✓') : ''
            }}
          </span>
          <span
            v-if="node.entry.icon || iconColumn"
            aria-hidden="true"
            class="plain-entry-icon"
          >
            <slot
              v-if="node.entry.icon"
              name="icon"
              :entry="node.entry"
              :icon="node.entry.icon"
            />
          </span>
          <span
            class="plain-entry-copy"
            :class="{ 'plain-navigation-hidden-label': rail }"
          >
            <slot
              name="entry"
              :entry="node.entry"
            >
              {{ node.entry.label }}
            </slot>
            <small
              v-if="node.entry.description"
              :id="`${id}-description-${index}`"
            >
              {{ node.entry.description }}
            </small>
          </span>
          <kbd v-if="node.entry.kind !== 'submenu' && node.entry.shortcut">
            {{ node.entry.shortcut }}
          </kbd>
          <span
            v-if="node.entry.kind === 'submenu'"
            aria-hidden="true"
          >
            {{ node.expanded ? '▾' : '▸' }}
          </span>
        </component>
        <component
          :is="tree ? 'div' : EntryPopup"
          v-if="node.entry.kind === 'submenu' && node.expanded"
          :anchor="anchors.get(node.entry.key)"
          :side="
            !tree &&
            (!navigation ||
              parentKey !== undefined ||
              presentation !== 'horizontal')
          "
          :navigation="navigation"
          :presentation="presentation"
          @close="$emit('expand', node.entry.key, false)"
        >
          <EntryBranch
            :id="`${id}-sub-${index}`"
            :entries="node.children ?? []"
            :status="node.status"
            :label="node.entry.label"
            :navigation="navigation"
            :presentation="presentation"
            :parent-key="node.entry.key"
            @activate="$emit('activate', $event)"
            @expand="(key, open) => $emit('expand', key, open)"
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
        </component>
      </template>
    </li>
    <li
      v-if="status?.message"
      :role="navigation ? undefined : 'none'"
      class="plain-entry-status"
    >
      <span role="status">{{ status.message }}</span>
      <button
        v-if="status.failed"
        type="button"
        class="plain-button plain-color-primary plain-variant-text"
        :role="navigation ? undefined : 'menuitem'"
        :tabindex="navigation ? undefined : -1"
        @click="retry"
      >
        {{ status.retryLabel }}
      </button>
    </li>
  </ul>
</template>
