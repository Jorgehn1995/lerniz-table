<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const isChecked = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit('update:modelValue', value);
  }
});

function toggleCheck() {
  isChecked.value = !isChecked.value;
}
</script>

<template>
  <div>
    <button @click="toggleCheck">
      <img 
        v-if="!isChecked" 
        src="../icons/square.svg" 
        alt="Unchecked"
      />
      <img 
        v-else 
        src="../icons/square-check.svg" 
        alt="Checked"
      />
    </button>
  </div>
</template>

<style scoped>
button {
  border: 0;
  outline: none;
  cursor: pointer;
  height: 20px;
  width: 20px;
  background-color: transparent;
  padding: 0;
  margin: 0;
  transition: filter 0.2s ease;
}

button:hover {
  filter: brightness(0.8);
}

button:active {
  filter: brightness(0.7);
}

button img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>