import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Configuração mínima para evitar travamentos
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    // Desabilitar reportCompressedSize para acelerar
    reportCompressedSize: false,
    // Usar menos workers
    target: 'esnext',
  },
  // Logs mais verbosos para debug
  logLevel: 'info',
})
