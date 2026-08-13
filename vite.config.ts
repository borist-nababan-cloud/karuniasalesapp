import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
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
