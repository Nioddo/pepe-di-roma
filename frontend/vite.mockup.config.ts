import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Build del mockup y el wireframe navegables que van en diseño/v2.
// npm run mockup   → --mode mockup
// npm run wireframe → --mode wireframe
// Todo (JS, CSS e imágenes) termina dentro de un único .html (ver mockup/empaquetar.mjs).
export default defineConfig(({ mode }) => ({
  root: fileURLToPath(new URL('./mockup', import.meta.url)),
  base: './',
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL(`./mockup/dist-${mode}`, import.meta.url)),
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false
  }
}));
