import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    target: 'ES2020',
    minify: 'esbuild',
    cssMinify: true,
  },
})
