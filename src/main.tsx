import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ChunkErrorBoundary } from './utils/lazyRetry';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // ignore service worker registration errors in unsupported sandboxes
      });
    } else {
      // Never let a cached production SW hijack Vite dev /src/*.tsx module fetches
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((reg) => reg.unregister())))
        .catch(() => undefined);
      if ('caches' in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => undefined);
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <ChunkErrorBoundary>
    <App />
  </ChunkErrorBoundary>
);
