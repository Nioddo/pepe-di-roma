import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El backend de la Entrega 2 corre en el puerto 3000 y no habilita CORS.
// Vite reenvía todo lo que empieza con /api, así el navegador ve un solo origen
// y el backend queda intacto.
const BACKEND_URL = 'http://localhost:3000';

const apiProxy = {
  '/api': {
    target: BACKEND_URL,
    changeOrigin: true
  }
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: apiProxy
  },
  preview: {
    proxy: apiProxy
  }
});
