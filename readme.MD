# Lerniz Table

![Lerniz Table](https://img.shields.io/npm/v/lerniz-table.svg?style=flat-square)

**Lerniz Table** is a reusable table component for Vue 3 that keeps the first row and first column fixed. Designed to facilitate data visualization in large tables.

---

## 🚀 Installation

You can install the package using **pnpm**, **npm**, or **yarn**:

### Using pnpm:
```sh
pnpm add lerniz-table
```

### Using npm:
```sh
npm install lerniz-table
```

### Using yarn:
```sh
yarn add lerniz-table
```

---

## 📌 Usage

### 1️⃣ **Global Import (Vue Plugin)**
If you want to use the component globally, import and register it in your `main.ts` or `main.js`:

```ts
import { createApp } from 'vue';
import LernizTable from 'lerniz-table';
import App from './App.vue';

const app = createApp(App);
app.use(LernizTable);
app.mount('#app');
```

### 2️⃣ **Individual Import (Vue Component)**
If you only need to use it in a specific component, import it directly:

```vue
<script setup>
import { LernizTable } from 'lerniz-table';
</script>

<template>
  <LernizTable :isLoadingTable="false" :tableID="'my-table'" :zoom="100" :height="400" :showTable="true">
    <template #toolbar-top>
      <button>Button in top toolbar</button>
    </template>
    <template #first-cell>
      📌
    </template>
    <template #columns>
      <th>Column 1</th>
      <th>Column 2</th>
    </template>
    <template #rows>
      <tr>
        <td>Row 1</td>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </template>
  </LernizTable>
</template>
```

---

## ⚙️ **Available Props**

| Prop             | Type           | Default   | Description |
|-----------------|---------------|-----------|-------------|
| `isLoadingTable` | `Boolean`      | `false`   | Displays a loading indicator in the table. |
| `tableID`       | `String`       | `'table'` | Unique identifier for the table. |
| `zoom`          | `Number/String` | `100`    | Controls the zoom level of the table. |
| `height`        | `Number`       | `0`       | Table height in pixels. |
| `showTable`     | `Boolean`      | `true`    | Shows or hides the table. |

---

## 🎭 **Available Slots**

| Slot           | Description |
|---------------|-------------|
| `toolbar-top` | Area for buttons or options at the top of the table. |
| `toolbar-bottom` | Area for buttons or options at the bottom of the table. |
| `first-cell`  | Content of the first fixed cell. |
| `columns`     | Table columns. |
| `rows`        | Table rows. |
| `blank`       | Alternative content when `showTable` is `false`. |

---

## 🛠️ **Development & Contributions**

If you want to contribute to this project, follow these steps:

```sh
git clone https://github.com/Jorgehn1995/lerniz-table.git
cd lerniz-table
pnpm install
pnpm build
```

To test changes locally:
```sh
pnpm link
```
Then, in your project where you want to test the component:
```sh
pnpm link lerniz-table
```

---

## 📦 **Publishing to NPM** (For Maintainers)
If you need to publish a new version:
```sh
pnpm version patch
pnpm publish --access public
```

---

## 📄 **License**

This project is licensed under the **MIT** license.

📌 **Developed by Jorge Hernández.**

