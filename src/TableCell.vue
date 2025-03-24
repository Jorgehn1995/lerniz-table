<script setup lang="ts">
import { nextTick, ref, computed } from "vue";
import type { Header } from "./types";

const props = defineProps<{
  itemHeight: number;
  header: Header;
  item: any;
  isSelected: boolean;
  isEdit: boolean;
}>();

const emit = defineEmits([
  "cell-click",
  "cell-dblclick",
  "cell-change",
  "cell-valid",
  "cell-invalid",
]);

const cellRef = ref<HTMLElement | null>(null);
const isValidField = ref(true);

// Computed properties optimizadas
const headerType = computed(() => props.header.type ?? "text");
const headerField = computed(() => props.header.field);
const headerAlign = computed(() => `cell-${props.header.align ?? "left"}`);
const isTextInput = computed(() =>
  ["text", "date", "number"].includes(headerType.value)
);
const isSelect = computed(() => headerType.value === "select");

// Reglas de validación memoizadas
const currentRules = computed(() => props.header.rules || []);

const validateInput = (field: string) => {
  const currentValue = props.item[field];

  for (let i = 0; i < currentRules.value.length; i++) {
    const result = currentRules.value[i](currentValue);
    if (typeof result === "string") {
      if (isValidField.value) {
        isValidField.value = false;
        emit("cell-invalid", {
          id: props.item.id,
          field: headerField.value,
          message: result,
        });
      }
      return;
    }
  }

  if (!isValidField.value) {
    isValidField.value = true;
    emit("cell-valid", {
      id: props.item.id,
      field: headerField.value,
      message: "",
    });
  }
};

const makeChange = () => {
  emit("cell-change");
  requestAnimationFrame(() => {
    cellRef.value?.setAttribute("data-dirty", "true");
  });
};

// Handlers de eventos tipados
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    props.item[headerField.value] = target.value;
    validateInput(headerField.value);
  }
};

const handleSelect = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  if (target) {
    props.item[headerField.value] = target.value;
    makeChange();
  }
};

const handleCheckbox = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    props.item[headerField.value] = target.checked;
    makeChange();
  }
};
</script>

<template>
  <div
    ref="cellRef"
    class="cell data-cell"
    :style="{
      width: `${header.width}px`,
      minWidth: `${header.width}px`,
    }"
    @click="emit('cell-click')"
    @dblclick="emit('cell-dblclick')"
    :class="{ selected: isSelected, 'cell-error': !isValidField }"
  >
    <span v-if="header.prefix" class="prefix">{{ header.prefix }}</span>

    <template v-if="isEdit && isSelected">
      <input
        v-if="isTextInput"
        :key="headerType"
        :readonly="header.readonly"
        :class="['cell-input', headerAlign]"
        :type="headerType"
        :value="item[headerField]"
        @input="handleInput"
        @change="makeChange"
      />
      <select
        v-else-if="isSelect"
        :key="headerType"
        :value="item[headerField]"
        :class="['cell-input', headerAlign]"
        @change="handleSelect"
      >
        <option
          v-for="option in header.options"
          :key="option.value"
          :value="option.value"
          class="cell-option"
        >
          {{ option.text }}
        </option>
      </select>
      <input
        v-else
        type="checkbox"
        :checked="item[headerField]"
        :class="headerAlign"
        class="cell-input-checkbox"
        @change="handleCheckbox"
      />
    </template>

    <div v-else :class="['cell-text', headerAlign]">
      <template v-if="isSelect">
        {{ header.optionsMap?.[item[headerField]] ?? "-" }}
      </template>
      <template v-else-if="headerType === 'checkbox'">
        <span class="checkbox-text">{{ item[headerField] ? "✔" : "" }}</span>
      </template>
      <template v-else>
        {{ item[headerField] }}
      </template>
    </div>

    <div v-if="header.suffix" class="suffix">
      {{ header.suffix }}
    </div>
  </div>
</template>

<style scoped>
/* Estilos originales optimizados */
.checkbox-text {
  color: var(--text-color);
}

.prefix,
.suffix {
  opacity: 0.7;
}

input::selection {
  background-color: rgb(var(--theme-primary), 0.7);
  color: white;
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
  position: relative;
}

.selected {
  background: rgba(var(--theme-primary), 0.15) !important;
  outline: 2px solid rgb(var(--theme-primary));
  outline-offset: -2px;
  z-index: 1;
  position: relative;
}

.cell-error {
  background: rgb(var(--theme-error), 0.2) !important;
}

.cell-input-container {
  width: 100%;
  position: relative;
}

.cell-center {
  text-align: center;
  justify-content: center;
}

.cell-left {
  text-align: left;
  justify-content: flex-start;
}

.cell-right {
  text-align: right;
  justify-content: flex-end;
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
  display: flex;
  align-items: center;
  line-height: 1;
  vertical-align: middle;
}

.cell-input-checkbox {
  accent-color: rgb(var(--theme-primary));
}

.cell-option {
  width: 100%;
  font: inherit;
  font-size: inherit;
  color: inherit;
  background-color: transparent;
  padding: 8px 12px;
  border: none;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

[data-dirty="true"] {
  background-color: rgb(var(--theme-primary), 0.01);
  box-shadow: inset 0 0 30px rgba(var(--theme-primary), 0.04);
}
</style>
