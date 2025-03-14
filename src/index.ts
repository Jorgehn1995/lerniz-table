import { App } from "vue";
import LernizTable from "./LernizTable.vue";

export default {
  install: (app: App) => {
    app.component("LernizTable", LernizTable);
  },
};

export { LernizTable };
