<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { items, headers } from "./items";
import { Header } from "./types";

const itemHeight = 25;

const bgHeight = computed(() => {
  return items.length * itemHeight + "px";
});

const pinnedHeaders = ref<Header[]>([]);
const viewportHeaders = ref<Header[]>([]);

// Variables reactivas para mostrar en pantalla (pero limitaremos su actualización)
const scrollY = ref(0);
const scrollX = ref(0);
const pinnedLeftWidth = ref(50);

// Referencias a los elementos DOM
const mainRef = ref<HTMLElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const viewportHeaderRef = ref<HTMLElement | null>(null);

// ID para cancelar `requestAnimationFrame` si hay muchas llamadas seguidas
let rafId: number | null = null;

// Función auxiliar para cancelar un `requestAnimationFrame` pendiente
function cancelRafIfNeeded() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

// Manejadores de scroll con rAF para agrupar los updates
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
      // Sincroniza el header al scroll horizontal
      viewportHeaderRef.value.scrollLeft = x;
    }
  });
}

const pinnedFirstColumn = () => {
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
      // Sincroniza la vista principal al scroll horizontal
      viewportRef.value.scrollLeft = x;
    }
  });
}

onMounted(() => {
  viewportHeaders.value = headers;

  // Listeners de scroll con { passive: true }
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
  <div>
    <button @click="pinnedFirstColumn()">pinned first column</button>
    <div class="wrapped">
      <div class="header">
        <!-- Pinned a la izquierda -->
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
        <!-- Cabecera (header) que se sincroniza horizontalmente -->
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
          <!-- Columna fija (pinned-left) -->
          <div
            class="pinned-left fit"
            :style="{
              width: pinnedLeftWidth + 'px',
              minWidth: pinnedLeftWidth + 'px',
              height: bgHeight,
            }"
          >
            <div class="row" v-for="(item, i) in items" :key="i">
              <div class="cell firstColumn">
                {{ i + 1 }}
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
          <!-- Viewport principal, scroll vertical y horizontal -->
          <div class="viewport" :style="{ height: bgHeight }" ref="viewportRef">
            <div class="row" v-for="(item, rowIndex) in items" :key="rowIndex">
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

        <!-- Mostrar valores del scroll -->
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
