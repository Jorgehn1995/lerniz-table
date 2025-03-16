<script setup lang="ts">
import { Header } from "./types";

defineProps<{
  header: Header;
  itemHeight: number;
  sortField?: string | null;
  sortDirection?: string | null;
}>();
const emit = defineEmits(["header-click"]);
</script>
<template>
  <div
    class="cell header-cell"
    :key="header.field"
    :style="{
      width: header.width + 'px',
      minWidth: header.width + 'px',
    }"
    @click="emit('header-click', $event)"
  >
    <div class="header-content">
      <div class="header-text">
        {{ header.title }}
        <br />
        {{ header.subtitle }}
      </div>
      <div>
        <span v-if="sortField === header.field" class="sort-indicator">
          {{ sortDirection === "asc" ? "↑" : "↓" }}
        </span>
        <img src="./icons/dots-vertical.svg" alt="Unchecked" />
      </div>
    </div>
  </div>
</template>
<style scoped>
.header-text {
  white-space: nowrap; /* Evita que el texto se divida en varias líneas */
  overflow: hidden; /* Oculta el texto que no cabe */
  text-overflow: ellipsis; /* Muestra "..." cuando el texto es truncado */
  width: 200px; /* Ajusta el ancho del contenedor */
}
.cell {
  height: 100%;
  padding: 0 0.8rem;
  display: flex;
  align-items: center;
  gap: 2px;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background: var(--header-bg);
  color: var(--header-text);
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}
.header-cell {
  position: relative;
  cursor: pointer;
  user-select: none;
  background: var(--header-bg) !important;
  color: var(--header-text) !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.78rem;
  letter-spacing: 0.5px;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.header-content img {
  width: 20px;
}
.sort-indicator {
  font-size: 20px;
}
</style>
