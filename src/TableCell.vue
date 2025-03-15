<script setup lang="ts">
import { Header } from "./types";

defineProps<{
  itemHeight: number;
  header: Header;
  item: any;
  isSelected: boolean;
  isEdit: boolean;
}>();

const emit = defineEmits(["cell-click", "cell-dblclick", "cell-change"]);
</script>

<template>
  <div
    class="cell data-cell"
    :style="{
      width: header.width + 'px',
      minWidth: header.width + 'px',
    }"
    @click="emit('cell-click')"
    @dblclick="emit('cell-dblclick')"
    :class="{ selected: isSelected }"
  >
    <span class="prefix">
      {{ header.prefix }}
    </span>
    <div v-if="isEdit && isSelected" class="cell-input-container">
      <input
        v-if="['text', 'date', 'number'].includes(header.type ?? 'text')"
        ref="activeInput"
        :readonly="header.readonly ?? false"
        :class="`cell-input cell-${header.align ?? 'left'}`"
        :type="header.type ?? 'text'"
        v-model="item[header.field]"
        @change="emit('cell-change')"
      />
      <select
        v-else-if="header.type === 'select'"
        ref="activeInput"
        class="cell-input cell-input-select"
        v-model="item[header.field]"
        @change="emit('cell-change')"
      >
        <option
          v-for="(option, i) in header.options"
          :key="i"
          :value="option.value"
          class="cell-option"
        >
          {{ option.text }}
        </option>
      </select>
      <input
        v-else
        @change="emit('cell-change')"
        ref="activeInput"
        type="checkbox"
        :readonly="header.readonly ?? false"
        class="cell-input cell-input-checkbox"
        v-model="item[header.field]"
      />
    </div>
    <div v-else :class="`cell-text cell-${header.align ?? 'left'}`">
      <span v-if="['text', 'date', 'number'].includes(header.type ?? 'text')">
        {{ item[header.field] }}
      </span>
      <span v-else-if="header.type === 'select'">
        {{ header.optionsMap?.[item[header.field] ?? ""] ?? "-" }}
      </span>
      <span v-else class="checkbox-text">
        {{ item[header.field] ? "✔" : "" }}
      </span>
    </div>
    <div class="suffix">
      {{ header.suffix }}
    </div>
  </div>
</template>
<style scoped>
.prefix,
.suffix {
  opacity: 0.7;
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
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

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

.cell-input-container {
  width: 100%;
}

/* Estilo para cuando el option está seleccionado o en hover */
.cell-option:checked,
.cell-option:hover {
  background-color: rgba(
    0,
    0,
    0,
    0.1
  ); /* Fondo ligeramente oscuro al seleccionar o pasar el mouse */
  color: #333; /* Cambia el color del texto para mejorar el contraste */
}

/* Estilo para el foco (accesibilidad) */
.cell-option:focus {
  background-color: rgba(0, 0, 0, 0.05); /* Fondo más claro al enfocar */
  color: #000; /* Texto más oscuro para mejor legibilidad */
}

.cell-center {
  text-align: center;
  justify-content: center; /* Centra horizontalmente el contenido */
}

.cell-left {
  text-align: left;
  justify-content: flex-start; /* Asegura alineación a la izquierda */
}

.cell-right {
  text-align: right;
  justify-content: flex-end; /* Asegura alineación a la derecha */
}

.cell-input-number::-webkit-inner-spin-button,
.cell-input-number::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.cell-text,
.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: inherit;
  color: inherit;
  display: flex; /* Asegura que ambos elementos se comporten igual */
  align-items: center; /* Centra verticalmente el contenido */
  line-height: 1;
  vertical-align: middle;
}
.cell-input-checkbox {
  accent-color: #3f51b5;
}
.cell-option {
  width: 100%;
  font: inherit; /* Hereda la fuente del contenedor */
  font-size: inherit; /* Hereda el tamaño de la fuente */
  color: inherit; /* Hereda el color del texto */
  background-color: transparent; /* Fondo transparente */
  padding: 8px 12px; /* Espaciado interno para mejor legibilidad */
  border: none; /* Sin bordes */
  outline: none; /* Sin contorno al enfocar */
  appearance: none; /* Elimina el estilo por defecto del navegador */
  -webkit-appearance: none; /* Para compatibilidad con Safari */
  -moz-appearance: none; /* Para compatibilidad con Firefox */
  cursor: pointer; /* Cambia el cursor a pointer para indicar que es clickeable */
  transition: background-color 0.2s ease, color 0.2s ease; /* Transición suave */
}
</style>
