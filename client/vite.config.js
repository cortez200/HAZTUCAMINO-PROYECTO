import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  /* Rutas relativas: el build funciona en raíz (Express), en subcarpetas
     (GitHub Pages) y abriendo dist directo. */
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
});
