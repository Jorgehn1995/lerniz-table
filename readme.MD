# Lerniz Table

![Lerniz Table](https://img.shields.io/npm/v/lerniz-table.svg?style=flat-square)

A Vue 3 table component that provides Excel-like functionality with fixed headers and columns. Features keyboard navigation, sorting, and customizable slots.

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add lerniz-table

# Using npm
npm install lerniz-table

# Using yarn
yarn add lerniz-table
```

## 🔧 Component Props

```typescript
interface LernizTableProps<T extends Record<string, string | number | null>> {
  // Required Props
  items: T[]          // Array of data items to display
  headers: Header[]   // Array of column definitions
  
  // Optional Props
  editCells?: boolean // Enable cell editing (default: false)
  height?: number     // Fixed viewport height (default: auto)
  footer?: boolean    // Show footer row (default: false)
}
```

## 📋 Header Structure

Headers must follow this structure:

```typescript
interface Header {
  field: string      // Property name from data items
  label: string      // Display text for column
  width?: number     // Column width in pixels
  type?: 'text' | 'number'  // Data type for sorting
  isPinned?: boolean // Pin column to left side
}
```

### Example Header Configuration:

```javascript
const headers = [
  {
    field: 'id',
    label: 'ID',
    width: 80,
    type: 'number',
    isPinned: true
  },
  {
    field: 'name',
    label: 'Name',
    width: 200,
    type: 'text'
  }
]
```

## 🎯 Usage Example

```vue
<template>
  <LernizTable
    :items="items"
    :headers="headers"
    :editCells="true"
    :height="400"
  >
    <!-- Custom Menu Items Slot -->
    <template #custom-menu-items="{ header }">
      <button @click="handleHeaderAction(header)">
        Custom Action
      </button>
    </template>
  </LernizTable>
</template>

<script setup>
const items = [
  { id: 1, name: 'John Doe', age: 30 },
  { id: 2, name: 'Jane Smith', age: 25 }
]

const headers = [
  { field: 'id', label: 'ID', width: 80, type: 'number' },
  { field: 'name', label: 'Name', width: 200 },
  { field: 'age', label: 'Age', width: 100, type: 'number' }
]
</script>
```

## 🎨 Available Slots

| Slot Name | Parameters | Description |
|-----------|------------|-------------|
| `custom-menu-items` | `{ header: { col: number, element: HTMLElement } }` | Add custom menu items to column header context menu |
| `toolbar-top` | - | Content above the table |
| `toolbar-bottom` | - | Content below the table |
| `first-cell` | - | Content for top-left fixed cell |
| `columns` | - | Custom column header rendering |
| `rows` | - | Custom row rendering |
| `blank` | - | Content when table is hidden |

## ⌨️ Keyboard Navigation

For Excel-like keyboard navigation, add `data-col` and `data-row` attributes to input elements:

```vue
<input 
  type="text" 
  :data-col="columnIndex"
  :data-row="rowIndex"
  v-model="value"
>
```

## 🔄 Features

1. **Column Pinning**
   - Pin/unpin columns using header context menu
   - First column can be pinned by default

2. **Sorting**
   - Click headers to sort columns
   - Supports text and number sorting
   - Handles null/empty values

3. **Virtual Scrolling**
   - Efficient rendering of large datasets
   - Maintains smooth scrolling performance

4. **Responsive Design**
   - Adapts to container width
   - Horizontal scrolling for overflow

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/Jorgehn1995/lerniz-table.git

# Install dependencies
pnpm install

# Build component
pnpm build

# Test locally
pnpm link
```

## 📄 License

MIT Jorge Hernández
