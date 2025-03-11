<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { items, headers } from "./items";
import { Header } from "./types";

const itemHeight = 35;

const bgHeight = computed(() => {
  return items.length * itemHeight + "px";
});

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

// Nuevo: Función para calcular el ancho de la barra de scroll
function getScrollbarWidth() {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  outer.style.width = "100px";
  outer.style.position = "absolute";
  document.body.appendChild(outer);
  const scrollbarWidth = outer.offsetWidth - outer.clientWidth;
  document.body.removeChild(outer);
  return scrollbarWidth;
}

function cancelRafIfNeeded() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function handleMainScroll() {
  cancelRafIfNeeded();
  rafId = requestAnimationFrame(() => {
    if (mainRef.value) {
      scrollY.value = mainRef.value.scrollTop;
    }
  });
}

function handleViewportScroll() {
  cancelRafIfNeeded();
  rafId = requestAnimationFrame(() => {
    if (viewportRef.value && viewportHeaderRef.value) {
      const x = viewportRef.value.scrollLeft;
      scrollX.value = x;
      viewportHeaderRef.value.scrollLeft = x;
    }
  });
}

const pinnedFirstColumn = () => {
  if (viewportHeaders.value.length === 0) return;
  pinnedHeaders.value.push(viewportHeaders.value[0]);
  viewportHeaders.value.splice(0, 1);
  pinnedLeftWidth.value =
    50 +
    pinnedHeaders.value.reduce(
      (acumulador, elemento) => acumulador + (elemento.width || 0),
      0
    );
};

function handleViewportHeaderScroll() {
  cancelRafIfNeeded();
  rafId = requestAnimationFrame(() => {
    if (viewportHeaderRef.value && viewportRef.value) {
      const x = viewportHeaderRef.value.scrollLeft;
      scrollX.value = x;
      viewportRef.value.scrollLeft = x;
    }
  });
}

const buffer = 5;
const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollY.value / itemHeight) - buffer);
});
const endIndex = computed(() => {
  return Math.min(
    items.length,
    Math.ceil((scrollY.value + viewportHeight.value) / itemHeight) + buffer
  );
});
const visibleItems = computed(() => {
  return items.slice(startIndex.value, endIndex.value);
});

onMounted(() => {
  viewportHeaders.value = headers;
  if (mainRef.value) {
    viewportHeight.value = mainRef.value.clientHeight;
  }

  // Nuevo: Aplicar padding para compensar la barra de scroll vertical
  let scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth < 1) {
    scrollbarWidth = 8;
  }
  if (viewportHeaderRef.value) {
    viewportHeaderRef.value.style.marginRight = `${scrollbarWidth}px`;
  }

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
});

onUnmounted(() => {
  mainRef.value?.removeEventListener("scroll", handleMainScroll);
  viewportRef.value?.removeEventListener("scroll", handleViewportScroll);
  viewportHeaderRef.value?.removeEventListener(
    "scroll",
    handleViewportHeaderScroll
  );
});
</script>

<template>
  <div class="component-container">
    <button class="pin-button" @click="pinnedFirstColumn()">
      <span>📌 Fijar primera columna</span>
    </button>

    <div class="wrapped">
      <div class="header">
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
        <div class="main" ref="mainRef">
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
                paddingBottom: (items.length - endIndex) * itemHeight + 'px',
              }"
            >
              <div class="row" v-for="(item, i) in visibleItems" :key="i">
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
                >
                  {{ item[header.field] }}
                </div>
              </div>
            </div>
          </div>

          <div class="viewport" :style="{ height: bgHeight }" ref="viewportRef">
            <div
              :style="{
                paddingTop: startIndex * itemHeight + 'px',
                paddingBottom: (items.length - endIndex) * itemHeight + 'px',
              }"
            >
              <div
                class="row"
                v-for="(item, rowIndex) in visibleItems"
                :key="rowIndex"
              >
                <div
                  class="cell data-cell"
                  v-for="(header, colIndex) in viewportHeaders"
                  :key="header.field"
                  :style="{
                    width: header.width + 'px',
                    minWidth: header.width + 'px',
                  }"
                >
                  {{ item[header.field] }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="scroll-info">
          Scroll vertical: {{ scrollY }} px | Scroll horizontal:
          {{ scrollX }} px
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Añadir esta propiedad al viewport del header */
.header .viewport {
  box-sizing: border-box;
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

.row:hover .data-cell {
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
}

.firstColumn {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
  justify-content: center;
  border-left: none;
  font-weight: 500;
  background: var(--first-column-bg);
}

.layout .main {
  display: flex;
  overflow-y: auto;
  background: white;
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

/* Scrollbar styling */
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
