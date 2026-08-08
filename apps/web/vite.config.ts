import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Las credenciales viven en un único .env.local en la raíz del monorepo, que es
  // también de donde las lee el agente. Sin esto Vite las buscaría en apps/web.
  envDir: "../..",
  server: { port: 5173 },
});
