import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

console.log('✅ VITE CONFIG LOADED')
// console.log(`@ -> ${path.resolve(import.meta.dirname, "src")}`)
// console.log(`@shared -> ${path.resolve(import.meta.dirname, "../shared")}`)

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Enable HTTPS in development with self-signed certificate
    mode === 'development' ? basicSsl() : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
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
}));
