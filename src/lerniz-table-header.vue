<script setup lang="ts"></script>
<template>
  <div>
    <!-- Encabezado "row" -->
    <div
      :style="{
        position: 'relative',
        height: tableHeaderHeight + 'px',
        zIndex: 10,
      }"
      :class="{
        shadowFirstRow: showShadowThead,
      }"
    >
      <!-- Primera celda sticky (arriba-izquierda) -->
      <div
        class="firstCell"
        :class="{
          shadowFirstCellRight:
            showShadowFirstCellRight && !showShadowFirstCellBottom,
          shadowFirstCellBottom:
            showShadowFirstCellBottom && !showShadowFirstCellRight,
          shadowFirstCellAll:
            showShadowFirstCellBottom && showShadowFirstCellRight,
        }"
        :style="{
          top: 0,
          left: 0,
          zIndex: 11,
          height: tableHeaderHeight + 'px',
          minHeight: tableHeaderHeight + 'px',
          width: firstColumnWidth + 'px',
          minWidth: firstColumnWidth + 'px',
        }"
      >
        <slot name="first-cell"></slot>
      </div>
      <div
        :style="{
          display: 'flex',
          position: 'absolute',
          color: 'red',
          left: firstColumnWidth + tableScrollLeft + 'px',
          top: '0px',
          width: '100%',
          height: tableHeaderHeight + 'px',
          zIndex: 1,
        }"
      >
        <div
          v-for="(header, index) in props.headers"
          :key="`head-${index}-${header.field}`"
          class="headerCell"
          :style="{
            width: header.width + 'px',
            minWidth: header.width + 'px',
          }"
        >
          <slot name="header" :header="header">
            {{ header.text }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
<style></style>
