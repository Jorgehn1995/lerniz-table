<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Header } from "./types"
import './style.css'

/**
 * PROPS
 */
const props = withDefaults(defineProps<{
  isLoading?: boolean
  tableID?: string
  zoom?: number | string
  height?: number
  itemHeight?: number
  isBlankView?: boolean
  items: any[]
  headers: Header[]
}>(), {
  isLoading: false,
  tableID: 'divTable',
  zoom: 100,
  height: 0,
  itemHeight: 25,
  isBlankView: false,
})

/**
 * REFERENCIAS
 */
const boxRef = ref<HTMLElement | null>(null)
const toolbarTopRef = ref<HTMLElement | null>(null)
const toolbarBottomRef = ref<HTMLElement | null>(null)
const tableWrapperRef = ref<HTMLElement | null>(null)

/**
 * DIMENSIONES
 */
const windowHeight = ref(0)
const boxTop = ref(0)
const toolbarTopHeight = ref(0)
const toolbarBottomHeight = ref(0)
const firstColumnWidth = ref(40);

/**
 * STICKY / SHADOWS
 */
const showShadowThead = ref(false)
const showShadowFirstColumnRight = ref(false)
const showShadowFirstCellRight = ref(false)
const showShadowFirstCellBottom = ref(false)

/**
 * MODO MÓVIL
 */
const isMobile = ref(false)

/**
 * ZOOM
 */
const clampedZoom = computed(() => {
  const z = Number(props.zoom)
  if (z < 25) return 25
  if (z > 200) return 200
  return z
})
const fontSize = computed(() => (clampedZoom.value * 0.9) / 100)

/**
 * ALTURA DINÁMICA
 */
const tableHeight = computed(() => {
  if (props.height !== 0) {
    return props.height
  }
  // Ajuste automático al viewport
  return windowHeight.value - boxTop.value - toolbarTopHeight.value - toolbarBottomHeight.value
})

/**
 * VIRTUALIZACIÓN
 */
const scrollPositionY = ref(0)
const totalRows = computed(() => props.items.length)
const viewportRowCount = computed(() => {
  // cuántas filas caben aprox. en el alto disponible
  return Math.floor(tableHeight.value / props.itemHeight)
})
const buffer = 5
const startIndex = computed(() => {
  const rawIndex = Math.floor(scrollPositionY.value / props.itemHeight) - buffer
  return Math.max(rawIndex, 0)
})
const endIndex = computed(() => {
  const rawIndex = startIndex.value + viewportRowCount.value + buffer * 2
  return Math.min(rawIndex, totalRows.value)
})
const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value)
})

/**
 * FUNCIONES
 */
const handleResize = () => {
  if (typeof window === 'undefined') return

  windowHeight.value = window.innerHeight
  isMobile.value = window.innerWidth < 600

  if (boxRef.value) {
    const rect = boxRef.value.getBoundingClientRect()
    boxTop.value = rect.top
  }
  toolbarTopHeight.value = toolbarTopRef.value?.offsetHeight || 0
  toolbarBottomHeight.value = toolbarBottomRef.value?.offsetHeight || 0

  // Evita scroll en móvil
  document.body.style.overflow = isMobile.value ? 'hidden' : 'visible'
}

const handleTableScroll = () => {
  if (!tableWrapperRef.value) return
  const { scrollTop, scrollLeft } = tableWrapperRef.value
  scrollPositionY.value = scrollTop

  showShadowThead.value = scrollTop > 0
  showShadowFirstColumnRight.value = scrollLeft > 0
  showShadowFirstCellRight.value = scrollLeft > 0
  showShadowFirstCellBottom.value = scrollTop > 0
}

// Navegación con teclas flecha
const handleKeyDown = (event: KeyboardEvent) => {
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    return
  }

  const target = event.target as HTMLElement
  if (!target) return

  const rowIndex = Number(target.getAttribute('data-row'))
  const colIndex = Number(target.getAttribute('data-col'))
  if (isNaN(rowIndex) || isNaN(colIndex)) return

  event.preventDefault()

  const allCells = Array.from(
    (tableWrapperRef.value as HTMLElement).querySelectorAll('input[data-row][data-col]')
  ) as HTMLInputElement[]
  if (allCells.length === 0) return

  const maxRow = Math.max(...allCells.map(el => Number(el.getAttribute('data-row'))))
  const maxCol = Math.max(...allCells.map(el => Number(el.getAttribute('data-col'))))

  let nextRow = rowIndex
  let nextCol = colIndex

  switch (event.key) {
    case 'ArrowUp':

      nextRow = rowIndex > 0 ? (rowIndex - 1) : 0
      break
    case 'ArrowDown':
      nextRow = rowIndex < maxRow ? (rowIndex + 1) : maxRow
      break
    case 'ArrowLeft':
      nextCol = colIndex === 0 ? maxCol : colIndex - 1

      break
    case 'ArrowRight':
      nextCol = colIndex === maxCol ? 0 : colIndex + 1

      break
  }


  const nextInput = (tableWrapperRef.value as HTMLElement).querySelector(
    `input[data-row="${nextRow}"][data-col="${nextCol}"]`
  ) as HTMLInputElement | null

  if (nextInput) {
    nextInput.focus()
  }
}

// Asegurar que la celda enfocada sea visible
const ensureElementInView = (targetEl: HTMLElement) => {
  const wrapper = tableWrapperRef.value
  if (!wrapper) return

  const targetRect = targetEl.getBoundingClientRect()
  const wrapperRect = wrapper.getBoundingClientRect()

  const stickyLeftWidth = 45
  const stickyHeaderHeight = 80

  if (targetRect.left < wrapperRect.left + stickyLeftWidth) {
    wrapper.scrollLeft -= (wrapperRect.left + stickyLeftWidth) - targetRect.left
  }
  if (targetRect.right > wrapperRect.right) {
    wrapper.scrollLeft += targetRect.right - wrapperRect.right
  }

  if (targetRect.top < wrapperRect.top + stickyHeaderHeight) {
    wrapper.scrollTop -= (wrapperRect.top + stickyHeaderHeight) - targetRect.top
  }
  if (targetRect.bottom > wrapperRect.bottom) {
    wrapper.scrollTop += targetRect.bottom - wrapperRect.bottom
  }
}

const handleFocusIn = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement
  if (!target) return
  if (target.tagName === 'INPUT' && target.hasAttribute('data-row')) {
    target.select()
    ensureElementInView(target)
  }
}

/**
 * WATCHERS Y CICLO DE VIDA
 */
watch(isMobile, () => {
  setTimeout(() => {
    handleResize()
  }, 50)
})

onMounted(() => {
  if (typeof window === 'undefined') return

  handleResize()
  window.addEventListener('resize', handleResize)
  tableWrapperRef.value?.addEventListener('scroll', handleTableScroll)
  tableWrapperRef.value?.addEventListener('keydown', handleKeyDown)
  tableWrapperRef.value?.addEventListener('focusin', handleFocusIn, true)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return

  window.removeEventListener('resize', handleResize)
  tableWrapperRef.value?.removeEventListener('scroll', handleTableScroll)
  tableWrapperRef.value?.removeEventListener('keydown', handleKeyDown)
  tableWrapperRef.value?.removeEventListener('focusin', handleFocusIn, true)
})
</script>

<template>
  <div ref="boxRef" class="theme-lerniz-table classBigUniqueTableDFlex classBigUniqueTableFlexColumn" id="box">
    <!-- Toolbar superior -->
    <div ref="toolbarTopRef" class="classBigUniqueTableTollbarTop" id="toolbar-top">
      <slot name="toolbar-top"></slot>
    </div>

    <!-- Contenedor scroll principal -->
    <div ref="tableWrapperRef" class="classBigUniqueTableTableWrapper align-stretch classBigUniqueTableNiceScroll"
      :style="{ height: tableHeight + 'px' }" id="table">
      <!-- Spinner loading -->
      <div v-if="props.isLoading" style="height: 350px"
        class="classBigUniqueTableDFlex classBigUniqueTableJustifyCenter classBigUniqueTableAlignCenter">
        <div class="classBigUniqueTableSpinner"></div>
      </div>

      <!-- Contenido principal -->
      <div v-else :id="props.tableID" class="divTable" :style="{ 'font-size': fontSize + 'rem' }">
        <!-- Si no está en blankView, pintamos "div" table -->
        <div v-if="!props.isBlankView">
          <!-- Encabezado "row" sticky -->
          <div class="divRow headerRow" :class="{
            'shadowFirstRow': showShadowThead,
          }" style="position: sticky; top: 0; z-index: 10;">
            <!-- Primera celda sticky (arriba-izquierda) -->
            <div class="divCell stickyCorner" :class="{
              'shadowFirstCellRight': showShadowFirstCellRight && !showShadowFirstCellBottom,
              'shadowFirstCellBottom': showShadowFirstCellBottom && !showShadowFirstCellRight,
              'shadowFirstCellAll': showShadowFirstCellBottom && showShadowFirstCellRight
            }" style="position: sticky; left: 0; top: 0; z-index: 11; "
              :style="{ width: firstColumnWidth + 'px', minWidth: firstColumnWidth + 'px' }">
              <slot name="first-cell"></slot>
            </div>

            <!-- Resto de celdas de cabecera -->
            <div v-for="(header, index) in props.headers" :key="`head-${index}-${header.field}`"
              class="divCell headerCell" :style="{ width: header.width + 'px', minWidth: header.width + 'px' }">
              <slot name="header" :header="header">
                {{ header.text }}
              </slot>
            </div>
          </div>

          <!-- Body con virtualización -->
          <div class="divBody" :style="{
            'padding-top': (startIndex * props.itemHeight) + 'px',
            'padding-bottom': ((totalRows - endIndex) * props.itemHeight) + 'px',
          }">
            <!-- Renderizamos solo las filas visibles -->
            <div v-for="(item, localIndex) in visibleItems" :key="startIndex + localIndex" class="divRow"
              :style="{ height: props.itemHeight + 'px' }">
              <!-- Primera columna sticky -->
              <div class="divCell stickyLeft" :class="{
                'shadownFirsColumn': showShadowFirstCellRight
              }" style="position: sticky; left: 0; z-index: 9;"
                :style="{ width: firstColumnWidth + 'px', minWidth: firstColumnWidth + 'px' }">
                {{ (startIndex + localIndex) + 1 }}
              </div>

              <!-- Celdas data -->
              <div v-for="(colum, colIndex) in props.headers" :key="colIndex" class="divCell"
                :style="{ width: colum.width + 'px', minWidth: colum.width + 'px' }">
                <input :data-row="startIndex + localIndex" :data-col="colIndex" :type="colum.type"
                  :value="item[colum.field]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Blank View -->
        <div v-else
          class="classBigUniqueTableBlankArea classBigUniqueTableDFlex classBigUniqueTableJustifyCenter classBigUniqueTableAlignCenter"
          style="width: 100%; background-color: transparent;">
          <slot name="blank"></slot>
        </div>
      </div>
    </div>

    <!-- Toolbar inferior -->
    <div ref="toolbarBottomRef" id="toolbar-bottom">
      <slot name="toolbar-bottom"></slot>
    </div>
  </div>
</template>
<style scoped>
/* Contenedor principal que “simula” tabla */
.divTable {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

/* Cada “fila” */
.divRow {
  display: flex;
  flex-direction: row;
  width: 100%;
  box-sizing: border-box;
}

/* Cada “celda” */
.divCell {
  box-sizing: border-box;
  /* border: 1px solid #ddd;   si quieres ver bordes */
  /* vertical-align: middle;  si quieres centrar inline */
  overflow: hidden;
  /* si el contenido se pasa */
}
.divCell input{
  height: 100%;
}

/* Sticky de la primera columna */
.stickyLeft {
  background: white;
  /* Para tapar el contenido detrás en scroll horizontal */
}

/* Sticky de la cabecera */
.headerRow {
  background: white;
  /* Para tapar celdas al hacer scroll vertical */
}


/* Sombra derecha en primera columna */
.shadowFirstRow {
  box-shadow: 0px 5px 8px -2px rgba(0, 0, 0, 0.4);
}

.shadownFirsColumn {
  box-shadow: 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px -8px 0px 0px);
}


/* Sombras combinadas al cruzar scroll horizontal/vertical */
.shadowFirstCellRight {
  box-shadow: 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px -8px 0px 0px);
}

.shadowFirstCellBottom {
  box-shadow: 0px 4px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px 0px -8px 0px);
}

.shadowFirstCellAll {
  box-shadow: -4px 0px 8px -2px rgba(0, 0, 0, 0.4),
    4px 0px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px -8px 0px -8px);
}
</style>