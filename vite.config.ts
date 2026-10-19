import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { contentPages } from "./site/plugin";

export default defineConfig({
  plugins: [react(), contentPages()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        ja: resolve(import.meta.dirname, "ja.html"),
      },
    },
  },
});
