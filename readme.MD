# LernizTable Component

A feature-rich, performant Vue 3 table component with sorting, column pinning, cell editing, and virtual scrolling capabilities.

## Features

- **Column Sorting**: Click headers for ascending/descending sorting
- **Column Pinning**: Pin columns to the left for horizontal scrolling
- **Cell Editing**: Inline editing for cell content (text/number/select)
- **Virtual Scrolling**: Optimized performance for large datasets
- **Keyboard Navigation**: Arrow keys + Enter for cell navigation
- **Dark Mode Support**: Toggleable dark theme
- **Validation System**: Integrated error handling with visual feedback
- **Customizable Styling**: CSS variables for theme customization
- **Responsive Design**: Adapts to different screen sizes

## Installation

```bash
npm install lerniz-table
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import LernizTable from './components/LernizTable.vue'

const headers = ref([
  { title: 'ID', field: 'id', type: 'number', width: 80, isPinned: true },
  { title: 'Name', field: 'name', type: 'text', sortable: true },
  { title: 'Status', field: 'status', type: 'select', options: [
    { value: 1, text: 'Active' },
    { value: 2, text: 'Inactive' }
  ]}
])

const items = ref([
  { id: 1, name: 'Item 1', status: 1 },
  { id: 2, name: 'Item 2', status: 2 }
])

function handleChange(update: { header: Header, item: any }) {
  console.log('Cell updated:', update)
}
</script>

<template>
  <LernizTable
    :items="items"
    :headers="headers"
    edit-cells
    @change="handleChange"
  />
</template>
```

## Props

| Prop       | Type                 | Default | Description                                      |
|------------|----------------------|---------|--------------------------------------------------|
| items      | `T[]`                | `[]`    | Array of data objects                           |
| headers    | `Header[]`           | `[]`    | Column configuration (see Header structure)      |
| editCells  | `boolean`            | `false` | Enable cell editing                              |
| height     | `number`             | `400`   | Table height in pixels                          |
| footer     | `boolean`            | `true`  | Show footer with row count/error messages        |

## Header Structure

```ts
interface Header {
  title: string         // Column display name
  field: string         // Key in data objects
  type: 'text'|'number'|'select'
  width?: number        // Column width in pixels
  isPinned?: boolean    // Whether column is pinned left
  sortable?: boolean    // Allow sorting (default: true)
  options?: {           // Required for 'select' type
    value: string|number
    text: string
  }[]
}
```

## Events

```ts
// Emitted when cell content changes
@change="(update: { header: Header, item: T }) => void"
```

## Customization

Override CSS variables in your parent component:

```css
.lerniz-table {
  --theme-primary: 34, 19, 107;     /* RGB values */
  --theme-secondary: 94, 227, 242;
  --theme-error: 247, 0, 0;
  --border-color: rgba(0, 0, 0, 0.1);
  --cell-text: #333;
}
```

**Dark Mode:** Add `dark-mode` class to component container:
```vue
<LernizTable class="dark-mode" ... />
```

## Validation

Example validation implementation:
```vue
<script setup>
function validateEmail(row, value) {
  if (!value.includes('@')) {
    addError(row.id, 'email', 'Invalid email format', rowIndex)
  } else {
    removeError(row.id, 'email')
  }
}
</script>

<template>
  <LernizTable @cell-change="({ item }) => validateEmail(item)" />
</template>
```

## Keyboard Navigation

- **Arrow keys**: Navigate between cells
- **Enter**: Edit selected cell
- **Tab**: Move to next cell
- **Shift+Tab**: Move to previous cell

## Methods

Access via component ref:
```vue
<LernizTable ref="tableRef" />

<script setup>
const tableRef = ref()

// Example methods:
tableRef.value.togglePinLeft(header)
tableRef.value.ensureCellVisible(row, col)
</script>
```

## Styling

CSS variables available for customization:

| Variable               | Default                      | Description             |
|------------------------|------------------------------|-------------------------|
| --theme-primary        | `34, 19, 107` (RGB)          | Main theme color        |
| --theme-secondary      | `94, 227, 242` (RGB)         | Secondary color         |
| --theme-error          | `247, 0, 0` (RGB)            | Error highlight color   |
| --border-color         | `rgba(0, 0, 0, 0.06)`        | Border color            |
| --cell-text            | `rgba(0, 0, 0, 0.75)`        | Text color              |
| --row-hover            | `rgba(0, 0, 0, 0.04)`        | Row hover background    |

## License

MIT License