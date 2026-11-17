import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function preloadFirstHeroImagePlugin(): Plugin {
  return {
    name: 'ogya-preload-first-hero',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx?.bundle) return html;
        const firstHeroAsset = Object.keys(ctx.bundle).find((fileName) =>
          /assets\/hero_marketplace_showcase_.*\.webp$/.test(fileName)
        );
        if (!firstHeroAsset) return html;
        const href = firstHeroAsset.startsWith('/') ? firstHeroAsset : `/${firstHeroAsset}`;
        const preloadTag = `    <link rel="preload" as="image" type="image/webp" href="${href}" fetchpriority="high" />\n`;
        return html.replace('  </head>', `${preloadTag}  </head>`);
      },
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), preloadFirstHeroImagePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      cssMinify: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (
              id.includes('/node_modules/react/') ||
              id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/scheduler/')
            ) {
              return 'react-vendor';
            }
            if (
              id.includes('/node_modules/@firebase/firestore/') ||
              id.includes('/node_modules/firebase/firestore/') ||
              id.includes('firebase-firestore')
            ) {
              return 'firebase-firestore';
            }
            if (id.includes('/node_modules/firebase/') || id.includes('/node_modules/@firebase/')) {
              return 'firebase-core';
            }
            if (id.includes('/node_modules/lucide-react/')) {
              return 'icons-vendor';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
