<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, defineProps } from "vue";
import { Header, TableItem } from "./types";

export interface LernizTableProps<T extends Record<string, any>> {
  items: T[];
  headers: Header[];
}

const props = defineProps<LernizTableProps<Record<string, any>>>();

const itemHeight = 35;

const hoveredRowIndex = ref(-1);
const selectedRow = ref(-1);
const selectedCol = ref(-1);
const isDarkMode = ref(false);

const bgHeight = computed(() => `${props.items.length * itemHeight}px`);

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
  pinnedHeaders.value.push(viewportHeaders.value[0]);
  viewportHeaders.value.splice(0, 1);
  pinnedLeftWidth.value =
    50 +
    pinnedHeaders.value.reduce(
      (acumulador, elemento) => acumulador + (elemento.width || 0),
      0
    );
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
const visibleItems = computed(() =>
  props.items.slice(startIndex.value, endIndex.value)
);

function ensureCellVisible(row: number, col: number) {
  const rowTop = row * itemHeight;
  const rowBottom = (row + 1) * itemHeight;
  const currentScrollY = scrollY.value;
  const viewportHeightVal = viewportHeight.value;

  if (rowTop < currentScrollY) {
    mainRef.value?.scrollTo({ top: rowTop });
  } else if (rowBottom > currentScrollY + viewportHeightVal) {
    mainRef.value?.scrollTo({ top: rowBottom - viewportHeightVal });
  }

  if (col === 0) return;

  const totalPinned = pinnedHeaders.value.length;
  if (col <= totalPinned) return;

  const viewportColIndex = col - totalPinned - 1;
  if (viewportColIndex < 0 || viewportColIndex >= viewportHeaders.value.length)
    return;

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
      newRow = Math.min(props.items.length - 1, newRow + 1);
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

onMounted(() => {
  viewportHeaders.value = props.headers;
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
            <div class="cell firstColumn header-cell">#</div>
            <div
              class="cell header-cell"
              v-for="(header, colIndex) in pinnedHeaders"
              :key="header.field"
              :style="{
                width: header.width + 'px',
                minWidth: header.width + 'px',
              }"
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
              :style="{
                width: header.width + 'px',
                minWidth: header.width + 'px',
              }"
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
              height: bgHeight,
            }"
          >
            <div
              :style="{
                paddingTop: startIndex * itemHeight + 'px',
                paddingBottom: (props.items.length - endIndex) * itemHeight + 'px',
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
                  :style="{
                    width: header.width + 'px',
                    minWidth: header.width + 'px',
                  }"
                  @click="handleCellClick(startIndex + i, 1 + colIndex)"
                  @dblclick="enterSelected(startIndex + i, 1 + colIndex)"
                  :class="{
                    selected:
                      selectedRow === startIndex + i &&
                      selectedCol === 1 + colIndex,
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
                paddingBottom: (props.items.length - endIndex) * itemHeight + 'px',
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
                  :style="{
                    width: header.width + 'px',
                    minWidth: header.width + 'px',
                  }"
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
                      selectedCol === 1 + pinnedHeaders.length + colIndex,
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
          Scroll vertical: {{ scrollY }} px | Scroll horizontal:
          {{ scrollX }} px | Row hover: {{ hoveredRowIndex }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  background: var(--header-bg) !important;
  color: var(--header-text) !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.row {
  display: flex;
  height: v-bind(itemHeight + 'px');
  transition: background-color 0.2s ease;
}

.row.hovered .data-cell {
  background: var(--row-hover);
}

.cell {
  height: v-bind(itemHeight + 'px');
  padding: 0 0.8rem;
  display: flex;
  align-items: center;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background: var(--cell-bg);
  color: var(--text-color);
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
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

.selected {
  background: rgba(99, 102, 241, 0.15) !important;
  outline: 2px solid #6366f1;
  outline-offset: -2px;
  z-index: 1;
  position: relative;
}

.dark-mode .selected {
  outline-color: #818cf8;
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