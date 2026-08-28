import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/app/src' },  // absolute path untuk Docker
  },
  server: {
    host: '0.0.0.0',   // agar bisa diakses dari luar container
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://ecakra_backend_dev:8000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
})
