<script setup>
import { LernizTable } from './index'; // Importa el componente directamente
</script>

<template>
  <LernizTable :isLoadingTable="false" :tableID="'test-table'" :zoom="100" :showTable="true">
    <template #toolbar-top>
      <button class="button-2">
        Crear
      </button>
    </template>
    <template #columns>
      <th v-for="n, i in 15">Name</th>

    </template>
    <template #rows>
      <tr v-for="a, i in 30">
        <td>{{ i + 1 }}</td>
        <td>John Doe</td>
        <td v-for="r, x in 14">
          <input :data-row="i" :data-col="x" type="text">
        </td>
      </tr>
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