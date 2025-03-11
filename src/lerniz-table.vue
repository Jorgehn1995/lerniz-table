<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { items, headers } from "./items";
import { Header } from "./types";

const itemHeight = 35; // Ajustado para coincidir con el CSS (35px)

const bgHeight = computed(() => {
  return items.length * itemHeight + "px";
});

const pinnedHeaders = ref<Header[]>([]);
const viewportHeaders = ref<Header[]>([]);

const scrollY = ref(0);
const scrollX = ref(0);
const pinnedLeftWidth = ref(50);
const viewportHeight = ref(200); // Altura inicial, se actualiza en onMounted

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

// Cálculo de filas visibles
const buffer = 5; // Filas adicionales para scroll suave
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

  mainRef.value?.addEventListener("scroll", handleMainScroll, { passive: true });
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
  <div>
    <button @click="pinnedFirstColumn()">pinned first column</button>
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
            <div class="cell firstColumn">#</div>
            <div
              class="cell"
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
              class="cell"
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
          <!-- Sección pinned-left con virtualización -->
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
                <div class="cell firstColumn">
                  {{ startIndex + i + 1 }}
                </div>
                <div
                  class="cell"
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

          <!-- Viewport principal con virtualización -->
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
                  class="cell"
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
          Scroll Y (main): {{ scrollY }} px
          <br />
          Scroll X (viewport): {{ scrollX }} px
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapped {
  --head-color: #eaeaea;
  --viewport-color: #fff;
  --border-color: rgba(0, 0, 0, 0.1);
  --item-height: 35px;
}
.wrapped .header {
  display: flex;
  flex-direction: row;
}

.wrapped .header .pinned-left {
  overflow-x: hidden;

  background-color: var(--viewport-color);
  overflow-y: hidden;
}
.wrapped .header .viewport {
  display: flex;
  flex-direction: column;
  background-color: var(--viewport-color);
  /* Importante: ocultar scrollbar horizontal y manipularlo manualmente */
  overflow-x: auto;
  width: 100%;
  overflow-y: hidden;
  scrollbar-width: none !important;
}

.wrapped .layout .main {
  display: flex;
  flex-direction: row;
  overflow-y: auto;
  height: 200px;
}
.wrapped .layout .main .pinned-left {
  overflow-x: hidden;

  background-color: var(--viewport-color);
  overflow-y: hidden;
}
.wrapped .layout .main .viewport {
  display: flex;
  flex-direction: column;
  background-color: var(--viewport-color);
  overflow-x: auto;
  width: 100%;
  overflow-y: hidden;
  scrollbar-width: none !important;
}

.wrapped .row {
  display: flex;
  flex-direction: row;
  height: var(--item-height);
  max-height: var(--item-height);
}

.wrapped .cell {
  height: var(--item-height);
  max-height: var(--item-height);
  border: 1px solid var(--border-color);
  box-sizing: border-box;
}
.wrapped .firstColumn {
  background-color: var(--head-color);
  width: 50px;
  min-width: 50px;
  text-align: center;
}

.scroll-info {
  margin-top: 10px;
  font-size: 14px;
  color: #333;
}
</style>
