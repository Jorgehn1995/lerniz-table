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
      {{ header.text }}
      <span v-if="sortField === header.field" class="sort-indicator">
        {{ sortDirection === "asc" ? "↑" : "↓" }}
      </span>
    </div>
  </div>
</template>
<style scoped>
.cell {
  height: v-bind(itemHeight + "px");
  padding: 0 0.8rem;
  display: flex;
  align-items: center;
  gap: 2px;
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
</style>
