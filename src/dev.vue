<script setup>
import { LernizTable } from './index'; // Importa el componente directamente
</script>

<template>
  <LernizTable :isLoadingTable="false" :tableID="'test-table'" :zoom="100" :showTable="true">
    <template #columns>
      <th v-for="n, i in 15">Name</th>

    </template>
    <template #rows>
      <tr v-for="a, i in 30">
        <td>1</td>
        <td>John Doe</td>
        <td v-for="r, i in 14">30</td>
      </tr>
    </template>
  </LernizTable>
</template>
