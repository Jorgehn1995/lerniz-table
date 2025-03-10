<script setup>
import { onMounted, ref } from 'vue';
import { LernizTable } from './index';
import { items, headers } from "./items.ts"


</script>

<template>
  <LernizTable :items="items" :headers="headers">
    <template #toolbar-top>
      <button class="button-2">
        Crear
      </button>
    </template>

  </LernizTable>
</template>
<style>
/* CSS */
.button-2 {
  background-color: #a3b18a;
  border-radius: 8px;
  border-width: 0;
  color: #333333;
  cursor: pointer;
  display: inline-block;
  font-family: "Haas Grot Text R Web", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  list-style: none;
  margin: 0;
  padding: 10px 12px;
  text-align: center;
  transition: all 200ms;
  vertical-align: baseline;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
</style>