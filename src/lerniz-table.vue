<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, defineProps, type PropType } from 'vue'

/**
 * PROPS
 */
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
  showTable: {
    type: Boolean,
    default: true,
  },
})

/**
 * REFERENCIAS A ELEMENTOS DEL DOM
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

/**
 * SOMBREADOS/INDICADORES PARA CABECERA Y PRIMERA COLUMNA STICKY
 */
const showShadowThead = ref(false)
const showShadowFirstColumnRight = ref(false)
const showShadowFirstCellRight = ref(false)
const showShadowFirstCellBottom = ref(false)

/**
 * DETECCIÓN DE "MODO MÓVIL"
 */
const isMobile = ref(false)

/**
 * ZOOM LIMITADO ENTRE 25 Y 200
 */
const clampedZoom = computed(() => {
  const z = Number(props.zoom)
  if (z < 25) return 25
  if (z > 200) return 200
  return z
})
const fontSize = computed(() => (clampedZoom.value * 0.9) / 100)

/**
 * ALTURA DINÁMICA DE LA TABLA
 */
const tableHeight = computed(() => {
  return props.height === 0
    ? windowHeight.value - boxTop.value - toolbarTopHeight.value - toolbarBottomHeight.value
    : props.height
})

/**
 * FUNCIONES AUXILIARES
 */

// Ajusta dimensiones y "modo móvil" en cada resize
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

  document.body.style.overflow = isMobile.value ? 'hidden' : 'visible'
}

// Muestra sombras en la cabecera y la columna sticky cuando se hace scroll
const handleTableScroll = () => {
  if (!tableWrapperRef.value) return
  const { scrollTop, scrollLeft } = tableWrapperRef.value
  showShadowThead.value = scrollTop > 0
  showShadowFirstColumnRight.value = scrollLeft > 0
  showShadowFirstCellRight.value = scrollLeft > 0
  showShadowFirstCellBottom.value = scrollTop > 0
}

// Navegación de celdas con teclas flecha
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
      nextRow = rowIndex === 0 ? maxRow : rowIndex - 1
      break
    case 'ArrowDown':
      nextRow = rowIndex === maxRow ? 0 : rowIndex + 1
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

// Asegura que la celda enfocada sea visible al hacer scroll
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

// Al hacer focus en un input, seleccionarlo y desplazar vista si es necesario
const handleFocusIn = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement
  if (!target) return

  if (target.tagName === 'INPUT' && target.hasAttribute('data-row')) {
    target.select()
    ensureElementInView(target)
  }
}

/**
 * WATCHERS
 */
watch(isMobile, () => {
  setTimeout(() => {
    handleResize()
  }, 50)
})

/**
 * CICLO DE VIDA
 */
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
  <div ref="boxRef" class="classBigUniqueTableDFlex classBigUniqueTableFlexColumn" id="box">
    <!-- Toolbar superior -->
    <div ref="toolbarTopRef" id="toolbar-top">
      <slot name="toolbar-top"></slot>
    </div>

    <!-- Contenedor principal de la tabla, con scroll y altura dinámica -->
    <div ref="tableWrapperRef" class="classBigUniqueTableTableWrapper align-stretch classBigUniqueTableNiceScroll"
      :style="{ height: tableHeight + 'px' }" id="table">
      <!-- Spinner o área en blanco si está cargando -->
      <div v-if="props.isLoadingTable" style="height: 350px"
        class="classBigUniqueTableDFlex classBigUniqueTableJustifyCenter classBigUniqueTableAlignCenter">
        <div class="classBigUniqueTableSpinner"></div>
      </div>

      <!-- Contenido de la tabla real -->
      <div v-else :id="props.tableID">
        <!-- Si showTable es true, se muestra la tabla -->
        <table v-if="showTable" class="classBigUniqueTableFixedTable"
          :class="{ 'classBigUniqueTableShadowRightCol': showShadowFirstColumnRight }"
          :style="{ 'font-size': fontSize + 'rem' }">
          <thead :class="['classBigUniqueTableFixedThead', { 'classBigUniqueTableShadowUnder': showShadowThead }]">
            <tr>
              <!-- Primera celda sticky -->
              <th :class="{
                'classBigUniqueTableShadowFirstCellRight': showShadowFirstCellRight && !showShadowFirstCellBottom,
                'classBigUniqueTableShadowFirstCellBottom': showShadowFirstCellBottom && !showShadowFirstCellRight,
                'classBigUniqueTableShadowFirstCellAll': showShadowFirstCellBottom && showShadowFirstCellRight
              }">
                <slot name="first-cell"></slot>
              </th>
              <slot name="columns"></slot>
            </tr>
          </thead>

          <tbody class="classBigUniqueTableFixedColumn">
            <slot name="rows"></slot>
          </tbody>
        </table>

        <!-- Si showTable es false, mostramos un contenedor en blanco -->
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

<style>
:root {
  --excel-primary: rgb(168, 168, 168);
  /* Azul clásico de Excel */
  --excel-secondary: rgb(242, 242, 242);
  /* Gris claro para fondo */
  --excel-background: rgb(255, 255, 255);
  /* Blanco */
  --excel-border: rgb(198, 198, 198);
  /* Bordes de celdas */
  --excel-text: rgb(0, 0, 0);
  /* Texto negro */
  --excel-header-bg: rgb(214, 214, 214);
  /* Azul claro para encabezados */
  --excel-header-text: rgb(0, 32, 96);
  /* Azul oscuro para encabezados */
  --excel-hover: rgb(184, 204, 228);
  /* Resaltado en hover */
  --excel-error: rgb(255, 0, 0);
  /* Rojo para errores */
  --excel-error-bg: rgba(255, 0, 0, 0.1);
  /* Fondo de error */
}

/* Spinner */
.classBigUniqueTableSpinner {
  width: 32px;
  height: 32px;
  border: 4px solid var(--excel-border);
  border-top: 4px solid var(--excel-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Clases utilitarias propias */
.classBigUniqueTableDFlex {
  display: flex;
}

.classBigUniqueTableJustifyCenter {
  justify-content: center;
}

.classBigUniqueTableAlignCenter {
  align-items: center;
}

.classBigUniqueTableFlexColumn {
  flex-direction: column;
}

/* Scrollable contenedor principal */
.classBigUniqueTableTableWrapper {
  overflow-x: auto;
  overflow-y: auto;
  border-bottom: 1px solid var(--excel-border);
}

/* Tabla con "border-spacing" para permitir sticky */
.classBigUniqueTableFixedTable {
  width: auto;
  border-collapse: separate;
  border-spacing: 0;
}

/* Celdas y cabeceras */
.classBigUniqueTableFixedTable th,
.classBigUniqueTableFixedTable td {
  text-align: left;
  border: 1px solid var(--excel-border);
  height: 18px;
  position: relative;
  color: var(--excel-text);
}

/* Estilos de cabecera */
.classBigUniqueTableFixedTable th {
  border: 1px solid var(--excel-primary);
  font-size: 0.8em;
  background-color: var(--excel-header-bg);
  color: var(--excel-header-text);
  z-index: 3;
}

.classBigUniqueTableFixedTable td {
  font-size: 0.9em;
  background-color: var(--excel-background);
}

/* Inputs internos */
.classBigUniqueTableFixedTable td input {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: none;
  outline-color: var(--excel-primary);
  border-radius: 0px !important;
}

/* Resaltar errores */
.classBigUniqueTableInputError {
  color: var(--excel-error);
  font-weight: 500;
  background-color: var(--excel-error-bg);
  outline-color: var(--excel-error) !important;
}

/* Hover en las filas */
.classBigUniqueTableFixedTable tr:hover {
  background-color: var(--excel-hover);
}

/* Thead sticky */
.classBigUniqueTableFixedThead {
  position: sticky;
  top: 0;
  z-index: 2;
}

/* Primera columna sticky */
.classBigUniqueTableFixedColumn td:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
  padding: 2px 8px;
  text-align: center;
  background-color: var(--excel-background);
}

/* Sombra bajo la cabecera */
.classBigUniqueTableShadowUnder {
  box-shadow: 0px 5px 8px -2px rgba(0, 0, 0, 0.4);
}

/* Sombra derecha en primera columna */
.classBigUniqueTableShadowRightCol .classBigUniqueTableFixedColumn td:first-child {
  box-shadow: 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px -8px 0px 0px);
}

/* Ajuste para la primera celda <th> sticky */
.classBigUniqueTableFixedThead th:first-child {
  position: sticky;
  left: 0;
  top: 0;
  z-index: 4;
  min-width: 30px !important;
  height: 67px !important;
  min-height: 67px !important;
  background-color: var(--excel-header-bg);
}

/* Sombras combinadas al cruzar scroll horizontal/vertical */
.classBigUniqueTableShadowFirstCellRight {
  box-shadow: 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px -8px 0px 0px);
}

.classBigUniqueTableShadowFirstCellBottom {
  box-shadow: 0px 4px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px 0px -8px 0px);
}

.classBigUniqueTableShadowFirstCellAll {
  box-shadow: -4px 0px 8px -2px rgba(0, 0, 0, 0.4),
    4px 0px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px -8px 0px -8px);
}

/* Estilo de la columna "Name" */
.classBigUniqueTableName {
  min-width: 200px;
}

/* Área en blanco */
.classBigUniqueTableBlankArea {
  width: 100%;
  background-color: transparent;
}
</style>
