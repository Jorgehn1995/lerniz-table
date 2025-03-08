<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, defineProps, type PropType } from 'vue'

const props = defineProps({
  isLoadingTable: Boolean,
  tableID: {
    type: String as PropType<string>,
    default: 'table',
  },
  zoom: {
    type: [Number, String] as PropType<number | string>,
    default: 100,
  },
  height: {
    type: Number,
    default: 0,
  },
  showTable:{
    type:Boolean,
    default:true,
  }
})

const boxRef = ref<HTMLElement | null>(null)
const toolbarTopRef = ref<HTMLElement | null>(null)
const toolbarBottomRef = ref<HTMLElement | null>(null)
const tableWrapperRef = ref<HTMLElement | null>(null)

const windowHeight = ref(0)
const boxTop = ref(0)
const toolbarTopHeight = ref(0)
const toolbarBottomHeight = ref(0)
const showShadowThead = ref(false)
const showShadowFirstColumnRight = ref(false)
const showShadowFirstCellRight = ref(false)
const showShadowFirstCellBottom = ref(false)

const clampedZoom = computed(() => {
  const z = Number(props.zoom)
  if (z < 25) return 25
  if (z > 200) return 200
  return z
})

const fontSize = computed(() => (clampedZoom.value * 0.9) / 100)

const tableHeight = computed(() => {
  return props.height == 0 ? windowHeight.value - boxTop.value - toolbarTopHeight.value - toolbarBottomHeight.value : props.height;
})

const handleResize = () => {
  windowHeight.value = window.innerHeight
  if (boxRef.value) {
    const rect = boxRef.value.getBoundingClientRect()
    boxTop.value = rect.top
  }
  toolbarTopHeight.value = toolbarTopRef.value?.offsetHeight || 0
  toolbarBottomHeight.value = toolbarBottomRef.value?.offsetHeight || 0
}

const handleTableScroll = () => {
  if (!tableWrapperRef.value) return
  const { scrollTop, scrollLeft } = tableWrapperRef.value
  showShadowThead.value = scrollTop > 0
  showShadowFirstColumnRight.value = scrollLeft > 0
  showShadowFirstCellRight.value = scrollLeft > 0
  showShadowFirstCellBottom.value = scrollTop > 0
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  tableWrapperRef.value?.addEventListener('scroll', handleTableScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  tableWrapperRef.value?.removeEventListener('scroll', handleTableScroll)
})
</script>

<template>
  <div ref="boxRef" class="container">
    <div ref="toolbarTopRef" class="toolbar">
      <slot name="toolbar-top"></slot>
    </div>
    <div ref="tableWrapperRef" class="table-wrapper" :style="{ height: tableHeight + 'px' }">
      <div v-if="props.isLoadingTable" class="loading">
        Cargando...
      </div>
      <div v-else :id="props.tableID">
        <table v-if="showTable" class="fixed-table" :class="{ 'shadow-right-col': showShadowFirstColumnRight }"
          :style="{ 'font-size': fontSize + 'rem' }">
          <thead :class="['fixed-thead', { 'shadow-under': showShadowThead }]">
            <tr>
              <th :class="{
                'shadow-first-cell-right': showShadowFirstCellRight && !showShadowFirstCellBottom,
                'shadow-first-cell-bottom': showShadowFirstCellBottom && !showShadowFirstCellRight,
                'shadow-first-cell-all': showShadowFirstCellBottom && showShadowFirstCellRight,
              }">
                <slot name="first-cell"></slot>
              </th>
              <slot name="columns"></slot>
            </tr>
          </thead>
          <tbody class="fixed-column">
            <slot name="rows"></slot>
          </tbody>
        </table>
        <div v-else class="blank">
          <slot name="blank"></slot>
        </div>
      </div>
    </div>
    <div ref="toolbarBottomRef" class="toolbar">
      <slot name="toolbar-bottom"></slot>
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 10px;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  border-bottom: 1px solid #ccc;
}

.fixed-table {
  width: auto;
  border-collapse: separate;
  border-spacing: 0;
}

.fixed-table th,
.fixed-table td {
  text-align: left;
  border: 1px solid #ddd;
  height: 18px;
  position: relative;
}

.fixed-table th {
  background-color: #f5f5f5;
}

.shadow-under {
  box-shadow: 0px 5px 8px -2px rgba(0, 0, 0, 0.4);
}

.shadow-right-col .fixed-column td:first-child {
  box-shadow: 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
}

.shadow-first-cell-right {
  box-shadow: 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
}

.shadow-first-cell-bottom {
  box-shadow: 0px 4px 8px -2px rgba(0, 0, 0, 0.4);
}

.shadow-first-cell-all {
  box-shadow: -4px 0px 8px -2px rgba(0, 0, 0, 0.4), 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
}
</style>
