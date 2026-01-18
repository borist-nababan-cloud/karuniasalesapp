import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    port: 5555,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://karuniastrapi.nababancloud.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Keep the path as-is
      },
    },
  },
  preview: {
    port: 5555,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
