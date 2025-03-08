import { App } from "vue";
import LernizTable from "./lerniz-table.vue";

export default {
  install: (app: App) => {
    app.component("LernizTable", LernizTable);
  },
};

export { LernizTable };
