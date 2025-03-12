<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { items, headers } from "./items";
import { Header } from "./types";

const itemHeight = 35;

const hoveredRowIndex = ref(-1);
const selectedRow = ref(-1);
const selectedCol = ref(-1);

const bgHeight = computed(() => `${items.length * itemHeight}px`);

const pinnedHeaders = ref<Header[]>([]);
const viewportHeaders = ref<Header[]>([]);

const scrollY = ref(0);
const scrollX = ref(0);
const pinnedLeftWidth = ref(50);
const viewportHeight = ref(200);

const mainRef = ref<HTMLElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const viewportHeaderRef = ref<HTMLElement | null>(null);

let rafId: number | null = null;

/** Cancela un requestAnimationFrame activo si existe */
function cancelRafIfNeeded() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Maneja el scroll de cualquier elemento, asignando scrollX o scrollY según corresponda
 * y sincronizando el scroll en el otro elemento si es necesario.
 * @param {HTMLElement | null} sourceRef - Referencia del elemento que emite el scroll
 * @param {'x' | 'y'} axis - Eje que se va a sincronizar (scrollLeft o scrollTop)
 * @param {HTMLElement | null} [syncRef] - Opcional. Si se pasa, su scroll se sincroniza
 */
function handleScroll(sourceRef: HTMLElement | null, axis: "x" | "y", syncRef?: HTMLElement | null) {
  cancelRafIfNeeded();
  rafId = requestAnimationFrame(() => {
    if (!sourceRef) return;
    const value = axis === "y" ? sourceRef.scrollTop : sourceRef.scrollLeft;

    if (axis === "y") {
      scrollY.value = value;
    } else {
      scrollX.value = value;
      if (syncRef) {
        syncRef.scrollLeft = value;
      }
    }
  });
}

// Handlers específicos que reutilizan la misma función:
function handleMainScroll() {
  handleScroll(mainRef.value, "y");
}
function handleViewportScroll() {
  handleScroll(viewportRef.value, "x", viewportHeaderRef.value);
}
function handleViewportHeaderScroll() {
  handleScroll(viewportHeaderRef.value, "x", viewportRef.value);
}

// Fija la primera columna como "pinned"
const pinnedFirstColumn = () => {
  if (!viewportHeaders.value.length) return;
  pinnedHeaders.value.push(viewportHeaders.value[0]);
  viewportHeaders.value.splice(0, 1);
  pinnedLeftWidth.value =
    50 +
    pinnedHeaders.value.reduce(
      (acumulador, elemento) => acumulador + (elemento.width || 0),
      0
    );
};

/**
 * Devuelve el ancho del scrollbar.
 * Si es muy pequeño (<1), forzamos a 8 px para evitar inconsistencias entre navegadores.
 */
function getScrollbarWidth() {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  outer.style.width = "100px";
  outer.style.position = "absolute";
  document.body.appendChild(outer);
  const scrollbarWidth = outer.offsetWidth - outer.clientWidth;
  document.body.removeChild(outer);
  return scrollbarWidth < 1 ? 8 : scrollbarWidth;
}

// Valores usados para el renderizado "virtual" (ventana)
const buffer = 5;
const startIndex = computed(() => Math.max(0, Math.floor(scrollY.value / itemHeight) - buffer));
const endIndex = computed(() =>
  Math.min(items.length, Math.ceil((scrollY.value + viewportHeight.value) / itemHeight) + buffer)
);
const visibleItems = computed(() => items.slice(startIndex.value, endIndex.value));

function ensureCellVisible(row: number, col: number) {
  // Desplazamiento vertical
  const rowTop = row * itemHeight;
  const rowBottom = (row + 1) * itemHeight;
  const currentScrollY = scrollY.value;
  const viewportHeightVal = viewportHeight.value;

  if (rowTop < currentScrollY) {
    mainRef.value?.scrollTo({ top: rowTop });
  } else if (rowBottom > currentScrollY + viewportHeightVal) {
    mainRef.value?.scrollTo({ top: rowBottom - viewportHeightVal });
  }

  // Desplazamiento horizontal
  if (col === 0) return; // Si es la primera columna (#), ya está siempre visible

  const totalPinned = pinnedHeaders.value.length;
  if (col <= totalPinned) return; // Si cae en la zona de "pinned", nada especial

  // Índice dentro de las columnas viewport
  const viewportColIndex = col - totalPinned - 1;
  if (viewportColIndex < 0 || viewportColIndex >= viewportHeaders.value.length) return;

  let start = 0;
  for (let i = 0; i < viewportColIndex; i++) {
    start += viewportHeaders.value[i].width || 0;
  }
  const end = start + (viewportHeaders.value[viewportColIndex].width || 0);

  const viewportWidth = viewportRef.value?.clientWidth || 0;
  const currentScrollX = scrollX.value;

  if (start < currentScrollX) {
    viewportRef.value?.scrollTo({ left: start });
  } else if (end > currentScrollX + viewportWidth) {
    viewportRef.value?.scrollTo({ left: end - viewportWidth });
  }
}

function handleCellClick(rowIndex: number, colIndex: number) {
  selectedRow.value = rowIndex;
  selectedCol.value = colIndex;
}

function handleDocumentClick(event: MouseEvent) {
  if (!mainRef.value?.contains(event.target as Node)) {
    selectedRow.value = -1;
    selectedCol.value = -1;
  }
}

function handleKeyDown(event: KeyboardEvent) {
  const { key } = event;
  const totalCols = 1 + pinnedHeaders.value.length + viewportHeaders.value.length;
  let newRow = selectedRow.value;
  let newCol = selectedCol.value;

  switch (key) {
    case "ArrowUp":
      event.preventDefault();
      newRow = Math.max(0, newRow - 1);
      break;
    case "ArrowDown":
      event.preventDefault();
      newRow = Math.min(items.length - 1, newRow + 1);
      break;
    case "ArrowLeft":
      event.preventDefault();
      // Evitamos que se quede en 0 para no chocar con la columna fija de "#"
      newCol = newCol - 1 === 0 ? 1 : Math.max(0, newCol - 1);
      break;
    case "ArrowRight":
      event.preventDefault();
      newCol = Math.min(totalCols - 1, newCol + 1);
      break;
    case "Enter":
      event.preventDefault();
      if (selectedRow.value >= 0 && selectedCol.value >= 0) {
        enterSelected(selectedRow.value, selectedCol.value);
      }
      break;
    default:
      return;
  }

  if (newRow !== selectedRow.value || newCol !== selectedCol.value) {
    selectedRow.value = newRow;
    selectedCol.value = newCol;
    nextTick(() => ensureCellVisible(newRow, newCol));
  }
}

const enterSelected = (row: number, col: number) => {
  console.log(`enter keydown - row: ${row}, col: ${col}`);
};

function addListeners() {
  mainRef.value?.addEventListener("scroll", handleMainScroll, { passive: true });
  viewportRef.value?.addEventListener("scroll", handleViewportScroll, { passive: true });
  viewportHeaderRef.value?.addEventListener("scroll", handleViewportHeaderScroll, { passive: true });
  document.addEventListener("click", handleDocumentClick);
}

function removeListeners() {
  mainRef.value?.removeEventListener("scroll", handleMainScroll);
  viewportRef.value?.removeEventListener("scroll", handleViewportScroll);
  viewportHeaderRef.value?.removeEventListener("scroll", handleViewportHeaderScroll);
  document.removeEventListener("click", handleDocumentClick);
}

onMounted(() => {
  viewportHeaders.value = headers;
  if (mainRef.value) {
    viewportHeight.value = mainRef.value.clientHeight;
    mainRef.value.focus();
  }

  const scrollbarWidth = getScrollbarWidth();
  if (viewportHeaderRef.value) {
    viewportHeaderRef.value.style.marginRight = `${scrollbarWidth}px`;
  }

  addListeners();
});

onUnmounted(() => {
  removeListeners();
});
</script>

<template>
  <div class="component-container">
    <button class="pin-button" @click="pinnedFirstColumn">
      <span>📌 Fijar primera columna</span>
    </button>

    <div class="wrapped">
      <!-- Header -->
      <div class="header">
        <!-- Pinned Header -->
        <div
          class="pinned-left"
          :style="{ width: pinnedLeftWidth + 'px', minWidth: pinnedLeftWidth + 'px' }"
        >
          <div class="row">
            <div class="cell firstColumn header-cell">#</div>
            <div
              class="cell header-cell"
              v-for="(header, colIndex) in pinnedHeaders"
              :key="header.field"
              :style="{ width: header.width + 'px', minWidth: header.width + 'px' }"
            >
              {{ header.text }}
            </div>
          </div>
        </div>

        <!-- Scrollable Header -->
        <div class="viewport" ref="viewportHeaderRef">
          <div class="row">
            <div
              class="cell header-cell"
              v-for="(header, colIndex) in viewportHeaders"
              :key="header.field"
              :style="{ width: header.width + 'px', minWidth: header.width + 'px' }"
            >
              {{ header.text }}
            </div>
          </div>
        </div>
      </div>

      <div class="layout">
        <!-- Cuerpo principal -->
        <div class="main" ref="mainRef" tabindex="0" @keydown="handleKeyDown">
          <!-- Pinned Column -->
          <div
            class="pinned-left fit"
            :style="{
              width: pinnedLeftWidth + 'px',
              minWidth: pinnedLeftWidth + 'px',
              height: bgHeight
            }"
          >
            <div
              :style="{
                paddingTop: startIndex * itemHeight + 'px',
                paddingBottom: (items.length - endIndex) * itemHeight + 'px'
              }"
            >
              <div
                class="row"
                v-for="(item, i) in visibleItems"
                :key="i"
                @mouseenter="hoveredRowIndex = startIndex + i"
                @mouseleave="hoveredRowIndex = -1"
                :class="{ hovered: hoveredRowIndex === startIndex + i }"
              >
                <div class="cell firstColumn data-cell">
                  {{ startIndex + i + 1 }}
                </div>
                <div
                  class="cell data-cell"
                  v-for="(header, colIndex) in pinnedHeaders"
                  :key="header.field"
                  :style="{ width: header.width + 'px', minWidth: header.width + 'px' }"
                  @click="handleCellClick(startIndex + i, 1 + colIndex)"
                  @dblclick="enterSelected(startIndex + i, 1 + colIndex)"
                  :class="{
                    selected:
                      selectedRow === startIndex + i &&
                      selectedCol === 1 + colIndex
                  }"
                >
                  {{ item[header.field] }}
                </div>
              </div>
            </div>
          </div>

          <!-- Scrollable columns -->
          <div class="viewport" :style="{ height: bgHeight }" ref="viewportRef">
            <div
              :style="{
                paddingTop: startIndex * itemHeight + 'px',
                paddingBottom: (items.length - endIndex) * itemHeight + 'px'
              }"
            >
              <div
                class="row"
                v-for="(item, rowIndex) in visibleItems"
                :key="rowIndex"
                @mouseenter="hoveredRowIndex = startIndex + rowIndex"
                @mouseleave="hoveredRowIndex = -1"
                :class="{ hovered: hoveredRowIndex === startIndex + rowIndex }"
              >
                <div
                  class="cell data-cell"
                  v-for="(header, colIndex) in viewportHeaders"
                  :key="header.field"
                  :style="{ width: header.width + 'px', minWidth: header.width + 'px' }"
                  @click="
                    handleCellClick(
                      startIndex + rowIndex,
                      1 + pinnedHeaders.length + colIndex
                    )
                  "
                  @dblclick="
                    enterSelected(
                      startIndex + rowIndex,
                      1 + pinnedHeaders.length + colIndex
                    )
                  "
                  :class="{
                    selected:
                      selectedRow === startIndex + rowIndex &&
                      selectedCol === 1 + pinnedHeaders.length + colIndex
                  }"
                >
                  {{ item[header.field] }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info de scroll -->
        <div class="scroll-info">
          Scroll vertical: {{ scrollY }} px | Scroll horizontal: {{ scrollX }} px
          | Row hover: {{ hoveredRowIndex }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selected {
  background: rgba(63, 81, 181, 0.1) !important;
  outline: 2px solid #3f51b5;
  outline-offset: -2px;
  z-index: 1;
  position: relative;
}

.component-container {
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  padding: 1rem;
}

.pin-button {
  background: #3f51b5;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pin-button:hover {
  background: #303f9f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.wrapped {
  --header-bg: #f8f9fa;
  --header-text: #454545;
  --first-column-bg: #f8f9fa;
  --row-hover: rgba(63, 81, 181, 0.05);
  --border-color: #e0e0e0;
  --item-height: 35px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.header {
  display: flex;
  background: var(--header-bg);
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-cell {
  background: var(--header-bg) !important;
  color: var(--header-text) !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.row {
  display: flex;
  height: var(--item-height);
  transition: background-color 0.2s ease;
}

.row.hovered .data-cell {
  background: var(--row-hover);
}

.cell {
  height: var(--item-height);
  padding: 0 0.8rem;
  display: flex;
  align-items: center;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background: white;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.firstColumn {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
  justify-content: center;
  border-left: none;
  font-weight: 500;
  background: var(--first-column-bg);
  cursor: default;
}

.layout .main {
  display: flex;
  overflow-y: auto;
  background: white;
  outline: none;
  height: 400px;
}

.pinned-left {
  background: var(--first-column-bg);
  z-index: 1;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.viewport {
  flex-grow: 1;
  overflow-x: auto;
  position: relative;
  overflow-y: hidden;
}

.scroll-info {
  padding: 0.8rem;
  font-size: 0.8rem;
  color: #666;
  background: #f8f9fa;
  border-top: 1px solid var(--border-color);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
