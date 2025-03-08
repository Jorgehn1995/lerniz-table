import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  const isDev = mode !== "production"; // Obtiene el modo actual correctamente

  return {
    plugins: [vue(), ...(isDev ? [] : [dts()])], // Solo genera .d.ts en modo build
    build: isDev
      ? {} // Si está en modo dev, usa la configuración predeterminada de Vite
      : {
          lib: {
            entry: "src/index.ts",
            name: "LernizTable",
            fileName: "lerniz-table",
            formats: ["es", "cjs", "umd"],
          },
          rollupOptions: {
            external: ["vue"],
            output: {
              globals: {
                vue: "Vue",
              },
            },
          },
        },
    server: {
      port: 3000,
    },
  };
});
