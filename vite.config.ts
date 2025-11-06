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
  // Otimizar dependências - excluir canvg e core-js que causam timeout
  optimizeDeps: {
    exclude: ['canvg', 'core-js'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
  },
  // Logs mais verbosos para debug
  logLevel: 'info',
})
