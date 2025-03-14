<script setup lang="ts">
defineProps<{
  header: any
  item: any
  isSelected: boolean
  isEdit: boolean
}>()

const emit = defineEmits(['cell-click', 'cell-dblclick'])
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
    {{ header.prefix }}
    <div v-if="isEdit && isSelected" class="cell-input-container">
      <input
        v-if="['text', 'date', 'number'].includes(header.type)"
        ref="activeInput"
        :readonly="header.readonly ?? false"
        :class="`cell-input cell-${header.align ?? 'left'}`"
        :type="header.type ?? 'text'"
        v-model="item[header.field]"
      />
      <select
        v-else-if="header.type === 'select'"
        ref="activeInput"
        class="cell-input cell-input-select"
        v-model="item[header.field]"
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
        ref="activeInput"
        type="checkbox"
        :readonly="header.readonly ?? false"
        class="cell-input cell-input-checkbox"
        v-model="item[header.field]"
      />
    </div>
    <div v-else :class="`cell-text cell-${header.align ?? 'left'}`">
      <span v-if="['text', 'date', 'number'].includes(header.type)">
        {{ item[header.field] }}
      </span>
      <span v-else-if="header.type === 'select'">
        {{ header.optionsMap?.[item[header.field] ?? ""] ?? "-" }}
      </span>
      <span v-else class="checkbox-text">
        {{ item[header.field] ? "✔" : "" }}
      </span>
    </div>
    {{ header.suffix }}
  </div>
</template>