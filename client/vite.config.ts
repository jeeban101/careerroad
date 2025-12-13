import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

console.log('✅ VITE CONFIG LOADED')
// console.log(`@ -> ${path.resolve(import.meta.dirname, "src")}`)
// console.log(`@shared -> ${path.resolve(import.meta.dirname, "../shared")}`)
// console.log(`@assets -> ${path.resolve(import.meta.dirname, "../attached_assets")}`)

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "../shared"),
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
