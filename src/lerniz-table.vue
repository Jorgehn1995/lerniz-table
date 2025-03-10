<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import type { Header } from "./types";

/**
 * PROPS
 */
const props = withDefaults(
  defineProps<{
    isLoading?: boolean;
    tableID?: string;
    zoom?: number | string;
    height?: number;
    itemHeight?: number;
    isBlankView?: boolean;
    items: any[];
    headers: Header[];
  }>(),
  {
    isLoading: false,
    tableID: "divTable",
    zoom: 100,
    height: 0,
    itemHeight: 25,
    isBlankView: false,
  }
);

/**
 * REFERENCIAS
 */
const boxRef = ref<HTMLElement | null>(null);
const toolbarTopRef = ref<HTMLElement | null>(null);
const toolbarBottomRef = ref<HTMLElement | null>(null);
const tableWrapperRef = ref<HTMLElement | null>(null);

/**
 * CONSTANTES Y DIMENSIONES
 */
const TABLE_TOOLBAR_TOP = 64;
const TABLE_HEADER_HEIGHT = 64;
const STICKY_LEFT_WIDTH = 45;
const STICKY_HEADER_HEIGHT = 80;

/**
 * REACTIVAS
 */
const windowHeight = ref(0);
const boxTop = ref(0);
const toolbarTopHeight = ref(0);
const toolbarBottomHeight = ref(0);
const firstColumnWidth = ref(40);
const tableScrollLeft = ref(0);
const tableScrollTop = ref(0);

/**
 * STICKY / SHADOWS
 */
const showShadowThead = ref(false);
const showShadowFirstColumnRight = ref(false);
const showShadowFirstCellRight = ref(false);
const showShadowFirstCellBottom = ref(false);

/**
 * MODO MÓVIL
 */
const isMobile = ref(false);

/**
 * ZOOM
 */
const clampedZoom = computed(() => {
  const z = Number(props.zoom);
  return z < 25 ? 25 : z > 200 ? 200 : z;
});
const fontSize = computed(() => (clampedZoom.value * 0.9) / 100);

/**
 * ALTURA DINÁMICA
 */
const tableHeight = computed(() => {
  if (props.height !== 0) return props.height;
  // Ajuste automático al viewport
  return (
    windowHeight.value -
    boxTop.value -
    toolbarTopHeight.value -
    toolbarBottomHeight.value
  );
});

/**
 * VIRTUALIZACIÓN
 */
const scrollPositionY = ref(0);
const totalRows = computed(() => props.items.length);
const viewportRowCount = computed(() => {
  return Math.floor(tableHeight.value / props.itemHeight);
});
const buffer = 5;
const startIndex = computed(() => {
  const rawIndex = Math.floor(scrollPositionY.value / props.itemHeight) - buffer;
  return Math.max(rawIndex, 0);
});
const endIndex = computed(() => {
  const rawIndex = startIndex.value + viewportRowCount.value + buffer * 2;
  return Math.min(rawIndex, totalRows.value);
});
const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value);
});

/* ------------------------------------------------------------------
 * FUNCIONES AUXILIARES
 * ------------------------------------------------------------------ */

/**
 * Actualiza dimensiones básicas, modo móvil y scroll del body.
 */
function handleResize() {
  if (typeof window === "undefined") return;

  windowHeight.value = window.innerHeight;
  isMobile.value = window.innerWidth < 600;

  if (boxRef.value) {
    const rect = boxRef.value.getBoundingClientRect();
    boxTop.value = rect.top;
  }
  toolbarTopHeight.value = toolbarTopRef.value?.offsetHeight || 0;
  toolbarBottomHeight.value = toolbarBottomRef.value?.offsetHeight || 0;

  // Evita scroll en móvil
  document.body.style.overflow = isMobile.value ? "hidden" : "visible";
}

/**
 * Maneja el evento scroll del contenedor principal.
 */
function handleTableScroll() {
  if (!tableWrapperRef.value) return;
  const { scrollTop, scrollLeft } = tableWrapperRef.value;
  tableScrollLeft.value = scrollLeft;
  tableScrollTop.value = scrollTop;
  scrollPositionY.value = scrollTop;

  showShadowThead.value = scrollTop > 0;
  showShadowFirstColumnRight.value = scrollLeft > 0;
  showShadowFirstCellRight.value = scrollLeft > 0;
  showShadowFirstCellBottom.value = scrollTop > 0;
}

/**
 * Asegura que el elemento enfocado sea visible en el scroll.
 */
function ensureElementInView(targetEl: HTMLElement) {
  const wrapper = tableWrapperRef.value;
  if (!wrapper) return;

  const targetRect = targetEl.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();

  // Ajustar en función de la lógica sticky
  if (targetRect.left < wrapperRect.left + STICKY_LEFT_WIDTH) {
    wrapper.scrollLeft -=
      wrapperRect.left + STICKY_LEFT_WIDTH - targetRect.left;
  }
  if (targetRect.right > wrapperRect.right) {
    wrapper.scrollLeft += targetRect.right - wrapperRect.right;
  }

  if (targetRect.top < wrapperRect.top + STICKY_HEADER_HEIGHT) {
    wrapper.scrollTop -=
      wrapperRect.top + STICKY_HEADER_HEIGHT - targetRect.top;
  }
  if (targetRect.bottom > wrapperRect.bottom) {
    wrapper.scrollTop += targetRect.bottom - wrapperRect.bottom;
  }
}

/**
 * Maneja la navegación con teclas de flecha.
 */
function handleKeyDown(event: KeyboardEvent) {
  const arrowMoves: Record<string, { row: number; col: number }> = {
    ArrowUp: { row: -1, col: 0 },
    ArrowDown: { row: 1, col: 0 },
    ArrowLeft: { row: 0, col: -1 },
    ArrowRight: { row: 0, col: 1 },
  };

  if (!arrowMoves[event.key]) return;

  const target = event.target as HTMLElement;
  if (!target) return;

  const rowIndex = Number(target.getAttribute("data-row"));
  const colIndex = Number(target.getAttribute("data-col"));
  if (isNaN(rowIndex) || isNaN(colIndex)) return;

  event.preventDefault();

  const allCells = Array.from(
    tableWrapperRef.value?.querySelectorAll("input[data-row][data-col]") ?? []
  ) as HTMLInputElement[];
  if (!allCells.length) return;

  const maxRow = Math.max(
    ...allCells.map((el) => Number(el.getAttribute("data-row")))
  );
  const maxCol = Math.max(
    ...allCells.map((el) => Number(el.getAttribute("data-col")))
  );

  let nextRow = rowIndex + arrowMoves[event.key].row;
  let nextCol = colIndex + arrowMoves[event.key].col;

  // Evitamos pasar de límites verticales
  if (nextRow < 0) nextRow = 0;
  else if (nextRow > maxRow) nextRow = maxRow;

  // Control de "wrap" horizontal (ir de la última celda a la primera y viceversa)
  if (arrowMoves[event.key].col !== 0) {
    if (nextCol < 0) nextCol = maxCol;
    else if (nextCol > maxCol) nextCol = 0;
  }

  const nextInput = tableWrapperRef.value?.querySelector(
    `input[data-row="${nextRow}"][data-col="${nextCol}"]`
  ) as HTMLInputElement | null;

  if (nextInput) nextInput.focus();
}

/**
 * Maneja el focus de inputs dentro de la tabla.
 */
function handleFocusIn(event: FocusEvent) {
  const target = event.target as HTMLInputElement;
  if (!target) return;
  if (target.tagName === "INPUT" && target.hasAttribute("data-row")) {
    target.select();
    ensureElementInView(target);
  }
}

/**
 * Asigna todos los listeners que necesitamos.
 */
function addEventListeners() {
  window.addEventListener("resize", handleResize);
  tableWrapperRef.value?.addEventListener("scroll", handleTableScroll);
  tableWrapperRef.value?.addEventListener("keydown", handleKeyDown);
  tableWrapperRef.value?.addEventListener("focusin", handleFocusIn, true);
}

/**
 * Elimina todos los listeners asignados.
 */
function removeEventListeners() {
  window.removeEventListener("resize", handleResize);
  tableWrapperRef.value?.removeEventListener("scroll", handleTableScroll);
  tableWrapperRef.value?.removeEventListener("keydown", handleKeyDown);
  tableWrapperRef.value?.removeEventListener("focusin", handleFocusIn, true);
}

/**
 * CICLO DE VIDA
 */
onMounted(() => {
  if (typeof window === "undefined") return;
  handleResize();
  addEventListeners();
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  removeEventListeners();
});
</script>

<template>
  <div ref="boxRef" class="lerniz-table" id="box">
    <!-- Toolbar superior -->
    <div
      ref="toolbarTopRef"
      class="toolbar-top"
      id="toolbar-top"
      :style="{ height: TABLE_TOOLBAR_TOP + 'px' }"
    >
      <slot name="toolbar-top"></slot>
    </div>

    <!-- Encabezado "row" -->
    <div
      :style="{
        position: 'relative',
        height: TABLE_HEADER_HEIGHT + 'px',
        zIndex: 10
      }"
      :class="{ shadowFirstRow: showShadowThead }"
    >
      <!-- Primera celda sticky (arriba-izquierda) -->
      <div
        class="firstCell"
        :class="{
          shadowFirstCellRight:
            showShadowFirstCellRight && !showShadowFirstCellBottom,
          shadowFirstCellBottom:
            showShadowFirstCellBottom && !showShadowFirstCellRight,
          shadowFirstCellAll:
            showShadowFirstCellBottom && showShadowFirstCellRight,
        }"
        :style="{
          top: 0,
          left: 0,
          zIndex: 2,
          height: TABLE_HEADER_HEIGHT + 'px',
          minHeight: TABLE_HEADER_HEIGHT + 'px',
          width: firstColumnWidth + 'px',
          minWidth: firstColumnWidth + 'px',
        }"
      >
        <slot name="first-cell"></slot>
      </div>

      <div
        :style="{
          display: 'flex',
          position: 'absolute',
          left: firstColumnWidth + (tableScrollLeft * -1) + 'px',
          top: '0px',
          width: '100%',
          height: TABLE_HEADER_HEIGHT + 'px',
          zIndex: -1,
        }"
      >
        <div
          v-for="(header, index) in props.headers"
          :key="`head-${index}-${header.field}`"
          class="headerCell"
          :style="{
            width: header.width + 'px',
            minWidth: header.width + 'px',
          }"
        >
          <slot name="header" :header="header">
            {{ header.text }}
          </slot>
        </div>
      </div>
    </div>

    <!-- Contenedor scroll principal -->
    <div
      ref="tableWrapperRef"
      :style="{ height: tableHeight + 'px', overflow: 'auto' }"
      id="table"
    >
      <div
        :id="props.tableID"
        class="divTable"
        :style="{ fontSize: fontSize + 'rem' }"
      >
        <!-- Tabla completa si no está en blankView -->
        <div v-if="!props.isBlankView">
          <div
            class="divBody"
            :style="{
              'padding-top': startIndex * props.itemHeight + 'px',
              'padding-bottom':
                (totalRows - endIndex) * props.itemHeight + 'px',
            }"
          >
            <!-- Solo las filas visibles -->
            <div
              v-for="(item, localIndex) in visibleItems"
              :key="startIndex + localIndex"
              class="divRow"
              :style="{ height: props.itemHeight + 'px' }"
            >
              <!-- Primera columna sticky -->
              <div
                class="divCell stickyLeft"
                :class="{ shadownFirsColumn: showShadowFirstCellRight }"
                :style="{
                  position: 'sticky',
                  left: 0,
                  zIndex: 9,
                  width: firstColumnWidth + 'px',
                  minWidth: firstColumnWidth + 'px'
                }"
              >
                {{ startIndex + localIndex + 1 }}
              </div>

              <!-- Celdas data -->
              <div
                v-for="(colum, colIndex) in props.headers"
                :key="colIndex"
                class="divCell"
                :style="{
                  width: colum.width + 'px',
                  minWidth: colum.width + 'px',
                }"
              >
                <input
                  :data-row="startIndex + localIndex"
                  :data-col="colIndex"
                  :type="colum.type"
                  :value="item[colum.field]"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Blank View -->
        <div v-else style="width: 100%; background-color: transparent">
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
.lerniz-table {
  --lerniz-table-toolbar: rgb(52, 78, 65);
  --lerniz-table-first-cell: rgb(88, 129, 87);
  --lerniz-table-first-row: rgb(58, 90, 64);
  --lerniz-table-first-column: rgb(229, 229, 229);
  --lerniz-table-header-border: rgb(69, 101, 76);
}

/* Barra superior */
.lerniz-table .toolbar-top {
  background-color: #344e41;
  color: white;
  padding: 8px;
}

/* Contenedor “tabla” */
.lerniz-table .divTable {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

/* Cada “fila” */
.lerniz-table .divRow {
  display: flex;
  flex-direction: row;
  width: 100%;
  box-sizing: border-box;
}

/* Primera celda sticky */
.lerniz-table .firstCell {
  background-color: var(--lerniz-table-first-cell);
  border-color: 1px solid var(--lerniz-table-header-border);
}

.lerniz-table .headerCell {
  background-color: var(--lerniz-table-first-row);
  border-color: 1px solid var(--lerniz-table-header-border);
  color: white;
  padding: 2px;
}

/* Cada “celda” */
.lerniz-table .divCell {
  box-sizing: border-box;
  border: 1px solid #ddd;
  overflow: hidden;
}

.divCell input {
  height: 100%;
  border: 0px;
}

/* Sticky de la primera columna */
.stickyLeft {
  background: white;
  text-align: center;
}

/* Sombras */
.shadowFirstRow {
  box-shadow: 0px 5px 8px -2px rgba(0, 0, 0, 0.4);
}

.shadownFirsColumn {
  box-shadow: 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px -8px 0px 0px);
}

.shadowFirstCellRight {
  box-shadow: 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px -8px 0px 0px);
}

.shadowFirstCellBottom {
  box-shadow: 0px 4px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px 0px -8px 0px);
}

.shadowFirstCellAll {
  box-shadow: -4px 0px 8px -2px rgba(0, 0, 0, 0.4), 4px 0px 8px -2px rgba(0, 0, 0, 0.4);
  clip-path: inset(0px -8px 0px -8px);
}
</style>
