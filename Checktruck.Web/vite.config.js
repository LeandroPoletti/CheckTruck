import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// A API (CheckTruck.Api) não tem CORS configurado: em dev as chamadas passam
// pelo proxy do Vite. O prefixo /backend evita conflito entre a rota SPA /login
// e o endpoint POST /login do Identity.
const API_TARGET = process.env.VITE_API_PROXY ?? 'http://localhost:5202'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/backend': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },
    },
  },
})
