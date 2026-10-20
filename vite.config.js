import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// GitHub Pages serves the site from /<repo-name>/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/jero-jones-web/' : '/',
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        quien: resolve(import.meta.dirname, 'quien.html'),
        dance: resolve(import.meta.dirname, 'dance.html'),
      },
    },
  },
});
