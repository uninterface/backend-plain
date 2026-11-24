<script setup lang="ts">
  import { computed } from 'vue'
  import FilterButton from './TableFilterButton.vue'
  import AddRow from './TableAddRow.vue'
  import SortIcon from './icons/sort.vue'
  import SortAscendingIcon from './icons/sort-ascending.vue'
  import SortDescendingIcon from './icons/sort-descending.vue'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  defineOptions({ inheritAttrs: false })
  import { useUiLoadingSurface } from '@uninterface/uninterface/backend'
  import Empty from './UiEmpty.vue'
  import LoadingRegion from './UiLoadingRegion.vue'
  import {
    useUiCollectionView,
    useUiTableSizing,
    useUiTableAddRow,
    type UiTableViewProps,
  } from '@uninterface/uninterface/backend'
  import Status from './CollectionStatus.vue'
  const props = defineProps<UiTableViewProps>()
  const { root, target, sentinel, rowRef, id, failure } =
    useUiCollectionView(props)
  const sizing = useUiTableSizing(props, root, id, { minimumHeader: true })
  const addGeometry = useUiTableAddRow({
    enabled: () => Boolean(props.addRow),
    bounded: () => props.height === 'full',
    host: () => root.value,
    summary: () =>
      target.value?.querySelector<HTMLElement>('[data-collection-summary]'),
    header: () => target.value?.querySelector<HTMLElement>('thead'),
    row: () =>
      target.value?.querySelector<HTMLElement>(
        'tbody tr:not([data-collection-add-track])',
      ),
  })
  const addTracks = computed(() => [
    ...(props.selection === 'none' ? [] : [sizing.selectionWidth.value]),
    ...props.columns.map((column) => sizing.width(column.key)),
  ])
  const addKeys = computed(() => [
    ...(props.selection === 'none' ? [] : ['selection']),
    ...props.columns.map((column) => column.key),
  ])
  const loadingSurface = {
    ...useUiLoadingSurface(() => root.value),
    // Keep header filter anchors available while a live query refreshes rows.
    interactionTarget: computed(
      () => target.value?.querySelector<HTMLElement>('tbody') ?? root.value,
    ),
  }
</script>
<template>
  <div
    class="plain-collection-frame"
    :data-collection-full="height === 'full' || undefined"
  >
    <div
      v-if="failed && failurePlacement === 'replacement' && !loading"
      ref="failure"
      class="plain-collection-failure"
      data-collection-failure="replacement"
    >
      <slot
        name="error"
        :placement="failurePlacement!"
        :error="error"
        :retry="retry"
        :can-retry="canRetry"
      />
    </div>
    <div
      ref="root"
      v-bind="$attrs"
      class="plain-collection"
      :data-full="height === 'full' || undefined"
      :data-loading-empty="(loading && rows.length === 0) || undefined"
      :data-scroll="scroll"
      :data-column-fit="sizing.fits.value"
      :data-add-row-compact="addGeometry.compact.value || undefined"
      :role="scroll !== 'none' ? 'region' : undefined"
      :aria-label="scroll !== 'none' ? label : undefined"
      :tabindex="scroll !== 'none' ? 0 : undefined"
    >
      <table
        v-show="sizing.fits.value"
        :style="sizing.tableStyle.value"
        ref="target"
        class="plain-table"
        :aria-label="label"
        :aria-busy="busy"
        tabindex="-1"
      >
        <colgroup>
          <col
            v-if="selection !== 'none'"
            :style="{ width: `${sizing.selectionWidth.value}px` }"
          />
          <col
            v-for="column in columns"
            :key="column.key"
            :style="{ width: `${sizing.width(column.key)}px` }"
          />
        </colgroup>
        <thead>
          <tr>
            <th
              v-if="selection !== 'none'"
              scope="col"
            >
              <input
                v-if="selection === 'multiple'"
                type="checkbox"
                :aria-label="selectPageLabel"
                :checked="pageSelected"
                :indeterminate="pageMixed"
                :disabled="!canSelectPage"
                @change="
                  selectPage(($event.target as HTMLInputElement).checked)
                "
              />
              <span v-else>{{ selectPageLabel }}</span>
            </th>
            <th
              v-for="(column, index) in columns"
              :key="column.key"
              scope="col"
              :aria-sort="column.primary ? column.sort : undefined"
              :id="sizing.columnId(column.key)"
              :style="sizing.cellStyle(column.key)"
            >
              <div
                :ref="sizing.contentRef(column.key)"
                class="plain-table-header"
                :style="{
                  ...sizing.contentStyle(column.key),
                  display: 'inline-flex',
                }"
              >
                <button
                  class="plain-table-sort"
                  v-if="column.sortable"
                  type="button"
                  :disabled="disabled"
                  :aria-describedby="
                    column.sortDescription ? `${id}-sort-${index}` : undefined
                  "
                  @click="column.requestSort()"
                >
                  <slot
                    name="label"
                    :column="column"
                  />
                  <component
                    :is="
                      column.sort === 'ascending'
                        ? SortAscendingIcon
                        : column.sort === 'descending'
                          ? SortDescendingIcon
                          : SortIcon
                    "
                    class="plain-table-sort-icon"
                    aria-hidden="true"
                  />
                  <span
                    v-if="showSortPriority && column.sort"
                    class="plain-table-sort-priority"
                    data-ui-sort-priority
                    aria-hidden="true"
                  >
                    {{ column.sortPriority }}
                  </span>
                </button>
                <slot
                  v-else
                  name="label"
                  :column="column"
                />
                <span
                  v-if="showSortPriority && column.sort"
                  @click.stop
                  @keydown.stop
                >
                  <slot
                    name="sort-actions"
                    :column="column"
                  />
                </span>
                <span
                  v-if="column.sortDescription"
                  :id="`${id}-sort-${index}`"
                  class="plain-collection-announcement"
                >
                  {{ column.sortDescription }}
                </span>
                <slot
                  v-if="column.filter"
                  name="filter"
                  :trigger="FilterButton"
                  :column="column"
                />
              </div>
              <span
                v-if="sizing.handle(column.key)"
                v-bind="sizing.handle(column.key)"
                class="plain-column-resizer"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.key"
            :ref="(element) => rowRef(row.key, element)"
          >
            <td v-if="selection !== 'none'">
              <input
                type="checkbox"
                :aria-label="row.selectLabel"
                :checked="row.context.selected"
                :disabled="!row.context.selectable"
                @change="
                  row.context.requestSelected(
                    ($event.target as HTMLInputElement).checked,
                  )
                "
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :style="sizing.cellStyle(column.key)"
            >
              <div
                :ref="sizing.contentRef(column.key, row.key)"
                class="plain-table-cell-content"
                :style="sizing.contentStyle(column.key)"
              >
                <slot
                  name="cell"
                  :row="row"
                  :column="column"
                />
              </div>
              <p
                v-if="
                  row.issue && column.key === columns[columns.length - 1]?.key
                "
              >
                {{ row.issue }}
              </p>
            </td>
          </tr>
          <tr
            v-if="
              empty || (failed && failurePlacement === 'initial' && !loading)
            "
          >
            <td
              :colspan="
                Math.max(1, columns.length + (selection === 'none' ? 0 : 1))
              "
            >
              <template v-if="failed">
                <div
                  v-if="failed && failurePlacement === 'initial' && !loading"
                  ref="failure"
                  class="plain-collection-failure"
                  data-collection-failure="initial"
                >
                  <slot
                    name="error"
                    :placement="failurePlacement!"
                    :error="error"
                    :retry="retry"
                    :can-retry="canRetry"
                  />
                </div>
              </template>
              <slot
                v-else
                name="empty"
              >
                <Empty :label="message" />
              </slot>
            </td>
          </tr>
          <tr
            v-if="infinite"
            data-collection-continuation
          >
            <td
              :colspan="
                Math.max(1, columns.length + (selection === 'none' ? 0 : 1))
              "
            >
              <div
                v-if="failed && failurePlacement === 'append' && !loading"
                ref="failure"
                class="plain-collection-failure"
                data-collection-failure="append"
              >
                <slot
                  name="error"
                  :placement="failurePlacement!"
                  :error="error"
                  :retry="retry"
                  :can-retry="canRetry"
                />
              </div>
              <div
                ref="sentinel"
                aria-hidden="true"
                class="plain-collection-sentinel"
              />
              <Status
                v-bind="props"
                suppress-announcement
                empty-in-body
              >
                <template
                  v-if="$slots['infinity-loading']"
                  #infinity-loading="values"
                >
                  <slot
                    name="infinity-loading"
                    v-bind="values"
                  />
                </template>
                <template
                  v-if="$slots['infinity-complete']"
                  #infinity-complete="values"
                >
                  <slot
                    name="infinity-complete"
                    v-bind="values"
                  />
                </template>
              </Status>
            </td>
          </tr>
          <tr
            v-if="addRow"
            data-collection-add-track
            class="plain-table-add-track"
          >
            <td
              :colspan="
                Math.max(1, columns.length + (selection === 'none' ? 0 : 1))
              "
            >
              <AddRow
                :tracks="addTracks"
                :keys="addKeys"
                :viewport="addGeometry.viewportWidth.value"
              >
                <slot name="add-row-action" />
              </AddRow>
            </td>
          </tr>
        </tbody>
        <tfoot
          v-if="dataSummary"
          data-collection-summary
          :data-summary-status="dataSummary.status"
          :aria-label="dataSummary.label"
        >
          <tr>
            <td v-if="selection !== 'none'" />
            <td
              v-for="(column, index) in columns"
              v-show="
                index === 0 || index >= (dataSummary.labelColumnSpan ?? 1)
              "
              :colspan="index === 0 ? dataSummary.labelColumnSpan : undefined"
              :key="column.key"
              :headers="
                index === 0
                  ? columns
                      .slice(0, dataSummary.labelColumnSpan ?? 1)
                      .map((column) => sizing.columnId(column.key))
                      .join(' ')
                  : sizing.columnId(column.key)
              "
              :style="
                index === 0 && (dataSummary.labelColumnSpan ?? 1) > 1
                  ? { textAlign: 'start' }
                  : sizing.cellStyle(column.key)
              "
            >
              <div
                :ref="
                  index === 0 && (dataSummary.labelColumnSpan ?? 1) > 1
                    ? undefined
                    : sizing.summaryRef(column.key)
                "
                :style="
                  index === 0 && (dataSummary.labelColumnSpan ?? 1) > 1
                    ? { minWidth: '0' }
                    : sizing.contentStyle(column.key)
                "
              >
                <slot
                  name="summary-cell"
                  :column="column"
                />
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
      <p
        v-if="!sizing.fits.value"
        role="status"
      >
        {{ sizeConstraintLabel }}
      </p>
      <div
        v-if="!infinite && failed && failurePlacement === 'append' && !loading"
        ref="failure"
        class="plain-collection-failure"
        data-collection-failure="append"
      >
        <slot
          name="error"
          :placement="failurePlacement!"
          :error="error"
          :retry="retry"
          :can-retry="canRetry"
        />
      </div>
      <Status
        v-if="!infinite"
        v-bind="props"
        empty-in-body
      >
        <template
          v-if="$slots['infinity-loading']"
          #infinity-loading="values"
        >
          <slot
            name="infinity-loading"
            v-bind="values"
          />
        </template>
        <template
          v-if="$slots['infinity-complete']"
          #infinity-complete="values"
        >
          <slot
            name="infinity-complete"
            v-bind="values"
          />
        </template>
      </Status>
      <div
        v-else
        class="plain-collection-status"
      >
        <span
          class="plain-collection-announcement"
          data-ui-loading-status
          role="status"
          aria-atomic="true"
        >
          {{ announcement }}
        </span>
      </div>
    </div>
    <div
      v-if="$slots.footer"
      class="plain-table-footer"
    >
      <slot name="footer" />
    </div>
  </div>
  <LoadingRegion
    :surface="loadingSurface"
    :loading="loading"
    :label="message"
    :announce="false"
    :manage-busy="false"
  />
</template>
