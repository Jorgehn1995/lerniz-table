<script
  setup
  lang="ts"
  generic="T extends Record<string, string | number | null>"
>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  defineProps,
} from "vue";
import { Header } from "./types";

export interface LernizTableProps<
  T extends Record<string, string | number | null>
> {
  items: T[];
  headers: Header[];
  editCells?: boolean;
}
import TableCell from "./TableCell.vue";
const props = defineProps<LernizTableProps<T>>();
const itemHeight = 35;

const hoveredRowIndex = ref(-1);
const selectedRow = ref(-1);
const selectedCol = ref(-1);
const isDarkMode = ref(false);

// Sorting state
const sortField = ref<string | null>(null);
const sortDirection = ref<"asc" | "desc" | null>(null);
const showSortMenu = ref(false);
const sortMenuPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const activeHeader = ref<Header | null>(null);

const bgHeight = computed(() => `${props.items.length * itemHeight}px`);

const headers = ref<Header[]>([]); // Usar props directamente
const pinnedHeaders = computed(() => headers.value.filter((h) => h.isPinned));
const viewportHeaders = computed(() =>
  headers.value.filter((h) => !h.isPinned)
);

const pinnedLeftWidth = computed(
  () =>
    50 +
    pinnedHeaders.value.reduce(
      (acumulador, elemento) => acumulador + (elemento.width || 0),
      0
    )
);

const togglePinLeft = (header: Header) => {
  header.isPinned = !header.isPinned;
  showSortMenu.value = false;
};

const scrollY = ref(0);
const scrollX = ref(0);
const viewportHeight = ref(200);

const mainRef = ref<HTMLElement | null>(null);
const activeInput = ref<HTMLInputElement[] | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const viewportHeaderRef = ref<HTMLElement | null>(null);

let rafId: number | null = null;

function cancelRafIfNeeded() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function handleScroll(
  sourceRef: HTMLElement | null,
  axis: "x" | "y",
  syncRef?: HTMLElement | null
) {
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

function handleMainScroll() {
  handleScroll(mainRef.value, "y");
}
function handleViewportScroll() {
  handleScroll(viewportRef.value, "x", viewportHeaderRef.value);
}
function handleViewportHeaderScroll() {
  handleScroll(viewportHeaderRef.value, "x", viewportRef.value);
}

const pinnedFirstColumn = () => {
  if (!viewportHeaders.value.length) return;
  headers.value[0].isPinned = true;
  showSortMenu.value = false;
};

function getScrollbarWidth() {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  outer.style.width = "100px";
  outer.style.position = "absolute";
  document.body.appendChild(outer);
  const scrollbarWidth = outer.offsetWidth - outer.clientWidth;
  document.body.removeChild(outer);
  return scrollbarWidth < 1 ? 0 : scrollbarWidth;
}

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollY.value / itemHeight) - 10)
);
const endIndex = computed(() =>
  Math.min(
    props.items.length,
    Math.ceil((scrollY.value + viewportHeight.value) / itemHeight) + 10
  )
);

// Computed sorted items
const sortedItems = computed(() => {
  if (!sortField.value || !sortDirection.value) return props.items;

  return [...props.items].sort((a: T, b: T) => {
    const header = headers.value.find((h) => h.field === sortField.value);
    if (!header || !sortField.value) return 0;

    const field = sortField.value;
    const aVal = field in a ? a[field] : null;
    const bVal = field in b ? b[field] : null;

    // Handle null/empty values
    const aStr =
      aVal === null || aVal === undefined || aVal === "" ? " " : String(aVal);
    const bStr =
      bVal === null || bVal === undefined || bVal === "" ? " " : String(bVal);

    if (header.type === "number") {
      return sortDirection.value === "asc"
        ? Number(aVal === null || aVal === undefined ? 0 : aVal) -
            Number(bVal === null || bVal === undefined ? 0 : bVal)
        : Number(bVal === null || bVal === undefined ? 0 : bVal) -
            Number(aVal === null || aVal === undefined ? 0 : aVal);
    }

    // Default to text comparison
    return sortDirection.value === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
});

const visibleItems = computed(() =>
  sortedItems.value.slice(startIndex.value, endIndex.value)
);

// Sort menu handling
function handleHeaderClick(event: MouseEvent, header: Header) {
  event.stopPropagation(); // Prevent event from bubbling to document
  const headerElement = event.target as HTMLElement;
  const rect = headerElement.getBoundingClientRect();
  const windowWidth = window.innerWidth;

  // Calculate menu position
  let x = rect.left;
  const y = rect.bottom;

  // Get menu width (or use default if not yet rendered)
  const menuWidth = 200; // Default min-width from CSS

  // Adjust x position if menu would overflow window
  if (x + menuWidth > windowWidth) {
    x = windowWidth - menuWidth - 10; // 10px padding from window edge
  }

  // Ensure x is never negative
  x = Math.max(10, x); // At least 10px from left edge

  sortMenuPosition.value = { x, y };
  activeHeader.value = header;
  showSortMenu.value = true;
}

function handleSort(direction: "asc" | "desc") {
  sortDirection.value = direction;
  sortField.value = activeHeader.value?.field || null;
  showSortMenu.value = false; // Close menu after selection
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".sort-menu") && !target.closest(".header-cell")) {
    showSortMenu.value = false;
  }
}

function ensureCellVisible(row: number, col: number) {
  nextTick(() => {
    // <-- Agregar nextTick aquí
    const rowTop = row * itemHeight;
    const rowBottom = (row + 1) * itemHeight;
    const currentScrollY = scrollY.value;
    const viewportHeightVal = viewportHeight.value;

    let newScrollY = currentScrollY;
    if (rowTop < currentScrollY) {
      newScrollY = rowTop;
    } else if (rowBottom > currentScrollY + viewportHeightVal) {
      newScrollY = rowBottom - viewportHeightVal;
    }

    if (newScrollY !== currentScrollY) {
      scrollY.value = newScrollY;
      mainRef.value?.scrollTo({ top: newScrollY, behavior: "smooth" });
    }

    // Scroll horizontal (código existente)
    if (col === 0) return;
    const totalPinned = pinnedHeaders.value.length;
    if (col <= totalPinned) return;

    const viewportColIndex = col - totalPinned - 1;
    if (
      viewportColIndex < 0 ||
      viewportColIndex >= viewportHeaders.value.length
    )
      return;

    let start = 0;
    for (let i = 0; i < viewportColIndex; i++) {
      start += viewportHeaders.value[i].width || 0;
    }
    const end = start + (viewportHeaders.value[viewportColIndex].width || 0);

    const viewportWidth = viewportRef.value?.clientWidth || 0;
    const currentScrollX = scrollX.value;

    let newScrollX = currentScrollX;
    if (start < currentScrollX) {
      newScrollX = start;
    } else if (end > currentScrollX + viewportWidth) {
      newScrollX = end - viewportWidth;
    }

    if (newScrollX !== currentScrollX) {
      scrollX.value = newScrollX;
      viewportRef.value?.scrollTo({ left: newScrollX, behavior: "smooth" });
    }
  });
}

function handleCellClick(rowIndex: number, colIndex: number) {
  selectedRow.value = rowIndex;
  selectedCol.value = colIndex;
  ensureCellVisible(rowIndex, colIndex); // Añade esta línea
  focusInput();
}

function handleKeyDown(event: KeyboardEvent) {
  const { key } = event;
  const totalCols =
    1 + pinnedHeaders.value.length + viewportHeaders.value.length;
  let newRow = selectedRow.value;
  let newCol = selectedCol.value;

  switch (key) {
    case "ArrowUp":
      event.preventDefault();
      newRow = Math.max(0, newRow - 1);

      break;
    case "ArrowDown":
      event.preventDefault();
      newRow = Math.min(sortedItems.value.length - 1, newRow + 1);

      break;
    case "ArrowLeft":
      event.preventDefault();
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

  selectedRow.value = newRow;
  selectedCol.value = newCol;
  focusInput();
  ensureCellVisible(newRow, newCol);
}

const timer = ref<number | null>(null);

const focusInput = () => {
  if (props.editCells) {
    if (timer.value != null) {
      clearTimeout(timer.value);
    }
    timer.value = setTimeout(() => {
      setFocus();
    }, 10);
  }
};
const setFocus = () => {
  const cell = document.getElementById(
    `cell-${selectedRow.value}-${selectedCol.value}`
  );
  if (!cell) return console.log("Celda no definida");

  const element = cell.querySelector("input, select") as
    | HTMLInputElement
    | HTMLSelectElement;
  if (!element) return console.log("Input no definido");

  element.focus();
  if (element instanceof HTMLInputElement) element.select();
};

const enterSelected = (row: number, col: number) => {
  console.log(`enter keydown - row: ${row}, col: ${col}`);
};

function addListeners() {
  mainRef.value?.addEventListener("scroll", handleMainScroll, {
    passive: true,
  });
  viewportRef.value?.addEventListener("scroll", handleViewportScroll, {
    passive: true,
  });
  viewportHeaderRef.value?.addEventListener(
    "scroll",
    handleViewportHeaderScroll,
    { passive: true }
  );
  document.addEventListener("click", handleDocumentClick);
}

function removeListeners() {
  mainRef.value?.removeEventListener("scroll", handleMainScroll);
  viewportRef.value?.removeEventListener("scroll", handleViewportScroll);
  viewportHeaderRef.value?.removeEventListener(
    "scroll",
    handleViewportHeaderScroll
  );
  document.removeEventListener("click", handleDocumentClick);
}
function setHeader() {
  headers.value = props.headers;
  headers.value.forEach((h) => {
    if (h.options) {
      h.optionsMap = h.options.reduce(
        (acc: { [key: string | number]: string }, item) => {
          acc[item.value] = item.text;
          return acc;
        },
        {} as { [key: string | number]: string }
      );
    }
  });
}

onMounted(() => {
  //headers.value = props.headers;
  setHeader();

  if (mainRef.value) {
    viewportHeight.value = mainRef.value.clientHeight;
    mainRef.value.focus();
  }

  const scrollbarWidth = getScrollbarWidth();
  if (viewportHeaderRef.value) {
    viewportHeaderRef.value.style.marginRight = `${scrollbarWidth}px`;
  }

  addListeners();
  document.addEventListener("click", handleClickOutside);
  document.addEventListener(
    "scroll",
    () => {
      if (showSortMenu.value) showSortMenu.value = false;
    },
    true
  );
  window.addEventListener("keydown", handleKeyDown); // <-- Agregar esto
});

onUnmounted(() => {
  removeListeners();
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener(
    "scroll",
    () => {
      if (showSortMenu.value) showSortMenu.value = false;
    },
    true
  );
  window.removeEventListener("keydown", handleKeyDown); // <-- Agregar esto
});

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;

  // Close if click was on scrollbar
  if (
    event.target === document.documentElement ||
    event.target === document.body
  ) {
    showSortMenu.value = false;
    return;
  }

  const menu = document.querySelector(".sort-menu");
  const isClickInsideMenu = menu?.contains(target);
  const isClickOnHeader = target.closest(".header-cell");

  if (!isClickInsideMenu && !isClickOnHeader) {
    showSortMenu.value = false;
  }
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};
</script>

<template>
  <div class="component-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="mode-controls">
      <button class="pin-button" @click="pinnedFirstColumn">
        <span>📌 Fijar primera columna</span>
      </button>
      <button class="theme-toggle" @click="toggleDarkMode">
        <span>{{ isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode" }}</span>
      </button>
    </div>

    <div class="wrapped">
      <!-- Header -->
      <div class="header">
        <!-- Pinned Header -->
        <div
          class="pinned-left"
          :style="{
            width: pinnedLeftWidth + 'px',
            minWidth: pinnedLeftWidth + 'px',
          }"
        >
          <div class="row">
            <div class="cell firstColumn header-cell"></div>
            <div
              class="cell header-cell"
              v-for="(header, colIndex) in pinnedHeaders"
              :key="header.field"
              :style="{
                width: header.width + 'px',
                minWidth: header.width + 'px',
              }"
              @click="handleHeaderClick($event, header)"
            >
              <div class="header-content">
                {{ header.text }}
                <span v-if="sortField === header.field" class="sort-indicator">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </div>
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
              :style="{
                width: header.width + 'px',
                minWidth: header.width + 'px',
              }"
              @click="handleHeaderClick($event, header)"
            >
              <div class="header-content">
                {{ header.text }}
                <span v-if="sortField === header.field" class="sort-indicator">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="layout">
        <!-- Cuerpo principal -->
        <div class="main" ref="mainRef" tabindex="0">
          <!-- Quitar @keydown aquí -->
          <!-- Pinned Column -->
          <div
            class="pinned-left fit"
            :style="{
              width: pinnedLeftWidth + 'px',
              minWidth: pinnedLeftWidth + 'px',
              height: bgHeight,
            }"
          >
            <div
              :style="{
                paddingTop: startIndex * itemHeight + 'px',
                paddingBottom:
                  (sortedItems.length - endIndex) * itemHeight + 'px',
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
                <div class="firstColumn data-cell text-center">
                  {{ startIndex + rowIndex + 1 }}
                </div>
                <TableCell
                  v-for="(header, colIndex) in pinnedHeaders"
                  :key="header.field"
                  :itemHeight="itemHeight"
                  :id="`cell-${startIndex + rowIndex}-${1 + colIndex}`"
                  :header="header"
                  :isEdit="editCells ?? true"
                  :item="item"
                  :isSelected="
                    selectedRow === startIndex + rowIndex &&
                    selectedCol === 1 + colIndex
                  "
                  @cell-click="
                    handleCellClick(startIndex + rowIndex, 1 + colIndex)
                  "
                  @cell-dblclick="
                    enterSelected(startIndex + rowIndex, 1 + colIndex)
                  "
                />
              </div>
            </div>
          </div>

          <!-- Scrollable columns -->
          <div class="viewport" :style="{ height: bgHeight }" ref="viewportRef">
            <div
              :style="{
                paddingTop: startIndex * itemHeight + 'px',
                paddingBottom:
                  (sortedItems.length - endIndex) * itemHeight + 'px',
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
                <TableCell
                  v-for="(header, colIndex) in viewportHeaders"
                  :key="header.field"
                  :itemHeight="itemHeight"
                  :id="`cell-${startIndex + rowIndex}-${
                    1 + pinnedHeaders.length + colIndex
                  }`"
                  :header="header"
                  :isEdit="editCells ?? true"
                  :item="item"
                  :isSelected="
                    selectedRow === startIndex + rowIndex &&
                    selectedCol === 1 + pinnedHeaders.length + colIndex
                  "
                  @cell-click="
                    handleCellClick(
                      startIndex + rowIndex,
                      1 + pinnedHeaders.length + colIndex
                    )
                  "
                  @cell-dblclick="
                    enterSelected(
                      startIndex + rowIndex,
                      1 + pinnedHeaders.length + colIndex
                    )
                  "
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Info de scroll -->
        <div class="scroll-info">
          Visible Items {{ visibleItems.length }} | Scroll vertical:
          {{ scrollY }} px | Scroll horizontal: {{ scrollX }} px | Row hover:
          {{ hoveredRowIndex }}
        </div>
      </div>
    </div>

    <!-- Sort Menu -->
    <div
      v-if="showSortMenu"
      class="sort-menu"
      :style="{
        position: 'fixed',
        left: sortMenuPosition.x + 'px',
        top: sortMenuPosition.y + 'px',
      }"
    >
      <div class="sort-menu-title">
        {{ activeHeader?.text }}
      </div>
      <div
        class="sort-menu-item"
        @click="handleSort('asc')"
        :class="{ disabled: !(activeHeader?.sortable ?? true) }"
      >
        <span class="sort-icon">↑</span>
        Orden Ascendente
      </div>
      <div
        class="sort-menu-item"
        @click="handleSort('desc')"
        :class="{ disabled: !(activeHeader?.sortable ?? true) }"
      >
        <span class="sort-icon">↓</span>
        Orden Descendente
      </div>
      <div class="sort-menu-divider"></div>
      <div
        class="sort-menu-item"
        @click="activeHeader && togglePinLeft(activeHeader)"
        :class="{ disabled: !(activeHeader?.sortable ?? true) }"
      >
        <span class="sort-icon">📌</span>
        {{
          activeHeader?.isPinned
            ? "Desfijar de la izquierda"
            : "Fijar a la izquierda"
        }}
      </div>
      <slot name="custom-menu-items" :header="activeHeader"></slot>
    </div>
  </div>
</template>
<style>
.disabled {
  opacity: 0.5; /* Da un efecto visual de deshabilitado */
  cursor: not-allowed; /* Cambia el cursor para indicar que no se puede hacer clic */
  pointer-events: none;
}

.sort-menu-title {
  font-size: 0.8rem;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}
.sort-menu-item {
  font-size: 0.8rem;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}
</style>

<style scoped>
.text-center{
  text-align: center;
}
.component-container {
  --header-bg: #f8f9fa;
  --header-text: #454545;
  --first-column-bg: #f8f9fa;
  --row-hover: rgba(63, 81, 181, 0.05);
  --border-color: #e0e0e0;
  --cell-bg: white;
  --scroll-info-bg: #f8f9fa;
  --scroll-info-text: #666;
  --component-bg: white;
  --text-color: #333;
}

.component-container.dark-mode {
  --header-bg: #2d2d2d;
  --header-text: #e0e0e0;
  --first-column-bg: #252525;
  --row-hover: rgba(99, 102, 241, 0.1);
  --border-color: #404040;
  --cell-bg: #1a1a1a;
  --scroll-info-bg: #2d2d2d;
  --scroll-info-text: #b0b0b0;
  --component-bg: #121212;
  --text-color: #e0e0e0;
}

.component-container {
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  padding: 1rem;
  background: var(--component-bg);
  color: var(--text-color);
  transition: background 0.3s ease, color 0.3s ease;
}

.mode-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.checkbox-text {
  color: #3f51b5;
}
.pin-button,
.theme-toggle {
  background: #3f51b5;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark-mode .pin-button,
.dark-mode .theme-toggle {
  background: #6366f1;
}

.pin-button:hover,
.theme-toggle:hover {
  filter: brightness(1.1);
}

.wrapped {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--cell-bg);
  transition: border-color 0.3s ease;
}

.header {
  display: flex;
  background: var(--header-bg);
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-cell {
  position: relative;
  cursor: pointer;
  user-select: none;
  background: var(--header-bg) !important;
  color: var(--header-text) !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-indicator {
  font-size: 12px;
}

.row {
  display: flex;
  height: v-bind(itemHeight + "px");
  transition: background-color 0.2s ease;
}

.row.hovered .data-cell {
  background: var(--row-hover);
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
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.layout .main {
  display: flex;
  overflow-y: auto;
  background: var(--cell-bg);
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
  background: var(--scroll-info-bg);
  color: var(--scroll-info-text);
  border-top: 1px solid var(--border-color);
  transition: all 0.3s ease;
}



.sort-menu {
  position: fixed;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px 0;
  min-width: 150px;
  max-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 2px; /* Small gap between header and menu */
}

.dark-mode .sort-menu {
  background: #2d2d2d;
  border-color: #404040;
}

.sort-menu-item:hover {
  background-color: #f5f5f5;
}

.dark-mode .sort-menu-item:hover {
  background-color: #404040;
}

.sort-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.sort-menu-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 4px 0;
}

@media screen and (max-width: 768px) {
  .sort-menu {
    max-width: calc(100vw - 20px); /* 10px padding on each side */
  }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--first-column-bg);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #4a4a4a;
  border-radius: 4px;
}

.dark-mode ::-webkit-scrollbar-thumb {
  background: #6366f1;
}

::-webkit-scrollbar-thumb:hover {
  background: #717171;
}

.dark-mode ::-webkit-scrollbar-thumb:hover {
  background: #818cf8;
}
</style>
