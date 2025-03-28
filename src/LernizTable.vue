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
import TableCell from "./TableCell.vue";
import TableHeader from "./TableHeader.vue";

export interface LernizTableProps<
  T extends Record<string, string | number | null>
> {
  autoselect?: boolean;
  items: T[];
  headers: Header[];
  editCells?: boolean;
  height?: number;
  footer?: boolean;
}

const emit = defineEmits(["change", "delete", "edit"]);

const props = defineProps<LernizTableProps<T>>();
const itemHeight = 35;

const autoselect = computed(() => {
  return props.autoselect || true;
});
const hoveredRowIndex = ref(-1);
const selectedRow = ref(-1);
const selectedCol = ref(-1);
const isDarkMode = ref(false);
const errorMessages = ref<Record<string, Record<string, string>>>({});

// Context menu
const contextMenuItem = ref({});
const contextMenuVisible = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const contextMenuRowIndex = ref(-1);

const firstError = computed(() => {
  for (const section in errorMessages.value) {
    for (const field in errorMessages.value[section]) {
      return errorMessages.value[section][field];
    }
  }
  return false;
});

// Sorting state
const sortField = ref<string | null>(null);
const sortDirection = ref<"asc" | "desc" | null>(null);
const showSortMenu = ref(false);
const sortMenuPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const activeHeader = ref<Header | null>(null);

const bgHeight = computed(() => `${props.items.length * itemHeight}px`);

const headers = ref<Header[]>([]);
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

const sortedItems = computed(() => {
  if (!sortField.value || !sortDirection.value) return props.items;

  return [...props.items].sort((a: T, b: T) => {
    const header = headers.value.find((h) => h.field === sortField.value);
    if (!header || !sortField.value) return 0;

    const field = sortField.value;
    const aVal = field in a ? a[field] : null;
    const bVal = field in b ? b[field] : null;

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

    return sortDirection.value === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
});

const visibleItems = computed(() =>
  sortedItems.value.slice(startIndex.value, endIndex.value)
);

function handleHeaderClick(event: MouseEvent, header: Header) {
  event.stopPropagation();
  const headerElement = event.target as HTMLElement;
  const rect = headerElement.getBoundingClientRect();
  const windowWidth = window.innerWidth;

  let x = rect.left;
  const y = rect.bottom;

  const menuWidth = 200;

  if (x + menuWidth > windowWidth) {
    x = windowWidth - menuWidth - 10;
  }

  x = Math.max(10, x);

  sortMenuPosition.value = { x, y };
  activeHeader.value = header;
  showSortMenu.value = true;
}

function handleSort(direction: "asc" | "desc") {
  sortDirection.value = direction;
  sortField.value = activeHeader.value?.field || null;
  showSortMenu.value = false;
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".sort-menu") && !target.closest(".header-cell")) {
    showSortMenu.value = false;
  }
}

function ensureCellVisible(row: number, col: number) {
  nextTick(() => {
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
  ensureCellVisible(rowIndex, colIndex);
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
  if (element instanceof HTMLInputElement && autoselect.value) element.select();
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

// Context menu handlers
function handleRowContextMenu(event: MouseEvent, rowIndex: number, item: any) {
  event.preventDefault();
  contextMenuItem.value = item;
  contextMenuRowIndex.value = rowIndex;
  contextMenuPosition.value = { x: event.clientX, y: event.clientY };
  contextMenuVisible.value = true;
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;

  // Cerrar menú de contexto
  const contextMenu = document.querySelector(".context-menu");
  const isClickInsideContextMenu = contextMenu?.contains(target);
  const isClickOnRow = target.closest(".row");

  if (!isClickInsideContextMenu && !isClickOnRow) {
    contextMenuVisible.value = false;
  }

  // Lógica existente para menú de ordenación
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

onMounted(() => {
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
  window.addEventListener("keydown", handleKeyDown);
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
  window.removeEventListener("keydown", handleKeyDown);
});

function addError(id: string, field: string, message: string, row: number) {
  if (!errorMessages.value[id]) {
    errorMessages.value[id] = {};
  }
  errorMessages.value[id][field] = `Fila ${row + 1} - ${message}`;
}
function removeError(id: string, field: string) {
  if (errorMessages.value[id]) {
    delete errorMessages.value[id][field];
    if (Object.keys(errorMessages.value[id]).length === 0) {
      delete errorMessages.value[id];
    }
  }
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};
</script>

<template>
  <div class="component-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="wrapped">
      <div class="header">
        <div
          class="pinned-left"
          :style="{
            width: pinnedLeftWidth + 'px',
            minWidth: pinnedLeftWidth + 'px',
            height: itemHeight * 1.77 + 'px',
          }"
        >
          <div class="row" :style="{ height: itemHeight * 1.5 + 'px' }">
            <div class="firstColumn"></div>

            <TableHeader
              v-for="(header, colIndex) in pinnedHeaders"
              :itemHeight="itemHeight"
              :key="header.field"
              :header="header"
              :sortDirection="sortDirection"
              :sortField="sortField"
              @header-click="handleHeaderClick($event, header)"
            />
          </div>
        </div>
        <div
          class="viewport"
          ref="viewportHeaderRef"
          :style="{ height: itemHeight * 1.77 + 'px' }"
        >
          <div class="row" :style="{ height: itemHeight * 1.5 + 'px' }">
            <TableHeader
              v-for="(header, colIndex) in viewportHeaders"
              :itemHeight="itemHeight"
              :key="header.field"
              :header="header"
              :sortDirection="sortDirection"
              :sortField="sortField"
              @header-click="handleHeaderClick($event, header)"
            />
          </div>
        </div>
      </div>
      <div class="layout">
        <div
          class="main"
          ref="mainRef"
          tabindex="0"
          :style="{ height: (height ?? 400) + 'px' }"
        >
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
                @contextmenu.prevent="
                  handleRowContextMenu($event, startIndex + rowIndex, item)
                "
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
                  @cell-change="
                    emit('change', {
                      header,
                      item,
                    })
                  "
                  @cell-invalid="
                    addError(
                      $event.id,
                      $event.field,
                      $event.message,
                      startIndex + rowIndex
                    )
                  "
                  @cell-valid="removeError($event.id, $event.field)"
                />
              </div>
            </div>
          </div>

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
                @contextmenu.prevent="
                  handleRowContextMenu($event, startIndex + rowIndex, item)
                "
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
                  @cell-change="
                    emit('change', {
                      header,
                      item,
                    })
                  "
                  @cell-invalid="
                    addError(
                      $event.id,
                      $event.field,
                      $event.message,
                      startIndex + rowIndex
                    )
                  "
                  @cell-valid="removeError($event.id, $event.field)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="scroll-info" v-if="footer ?? true">
          <div v-if="firstError" class="error-message">
            {{ firstError }}
          </div>
          <div v-else>{{ items.length }} registros</div>
          <div v-if="false">
            Visible Items {{ visibleItems.length }} | Scroll vertical:
            {{ scrollY }} px | Scroll horizontal: {{ scrollX }} px | Row hover:
            {{ hoveredRowIndex }}
          </div>
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
        {{ activeHeader?.title }}
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

    <!-- Context Menu -->
    <div
      v-if="contextMenuVisible"
      class="context-menu"
      :style="{
        position: 'fixed',
        left: contextMenuPosition.x + 'px',
        top: contextMenuPosition.y + 'px',
      }"
    >
      <slot
        name="context-menu-items"
        :row="sortedItems[contextMenuRowIndex]"
      ></slot>
    </div>
  </div>
</template>

<style>
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px 0;
  min-width: 150px;
  max-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1001;
}

.context-menu-item {
  font-size: 0.8rem;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: rgba(var(--theme-muted), 0.05);
}
</style>

<style scoped>
.text-center {
  text-align: center;
}
.component-container {
  --theme-primary: 34, 19, 107;
  --theme-secondary: 94, 227, 242;
  --theme-muted: 0, 0, 0;
  --theme-bg: 255, 255, 255;
  --theme-error: 247, 0, 0;

  --error-color: rgb(var(--theme-error), 0.4);
  --selected-bg: rgb(var(--theme-primary));

  --header-bg: rgb(var(--theme-muted), 0.03);
  --header-text: rgb(var(--theme-muted), 0.75);
  --cell-text: rgb(var(--theme-muted), 0.75);
  --cell-bg: rgb(var(--theme-bg));

  --first-column-bg: rgb(var(--theme-muted), 0.03);
  --row-hover: rgb(var(--theme-muted), 0.04);

  --border-color: rgb(var(--theme-muted), 0.06);
  --text-color: rgb(var(--theme-muted), 0.75);
  --component-bg: rgb(var(--theme-bg));

  --scroll-info-bg: rgb(var(--theme-bg));
  --scroll-info-text: rgb(var(--theme-muted));
}

.error-message {
  border-radius: 4px;
  padding: 4px;
  color: rgb(var(--theme-error), 1);
  background-color: rgb(var(--theme-error), 0.1);
}

.component-container {
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  padding: 0;
  background: var(--component-bg);
  color: var(--text-color);
  transition: background 0.3s ease, color 0.3s ease;
}

.mode-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
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
}

.pinned-left {
  z-index: 1;
  box-shadow: 0px 0 10px rgba(var(--theme-muted), 0.06);
}

.viewport {
  flex-grow: 1;
  overflow-x: auto;
  position: relative;
  overflow-y: hidden;
}
.main .viewport::-webkit-scrollbar {
  display: none;
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
  margin-top: 2px;
}

.sort-menu-item:hover {
  background-color: rgb(var(--theme-muted), 0.05);
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
    max-width: calc(100vw - 20px);
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
  background: rgb(var(--theme-muted), 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--theme-muted), 0.4);
}
</style>
