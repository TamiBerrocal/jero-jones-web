import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Settles the layout before first paint, in dev and in the build, so nothing jumps when the modules run:
// - adds `js` to <html> (CSS keeps the static no-JS hero and tour under `html:not(.js)`);
// - replaces the `<!-- nav-fit -->` marker after the nav with src/js/nav-fit.js, inlined.
const firstPaint = {
  name: 'first-paint',
  transformIndexHtml(html) {
    const navFit = readFileSync(resolve(import.meta.dirname, 'src/js/nav-fit.js'), 'utf8');
    return {
      html: html.replace('<!-- nav-fit -->', `<script>${navFit}</script>`),
      tags: [{ tag: 'script', children: "document.documentElement.classList.add('js')", injectTo: 'head-prepend' }],
    };
  },
};

// GitHub Pages serves the site from /<repo-name>/
export default defineConfig({
  plugins: [firstPaint],
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
