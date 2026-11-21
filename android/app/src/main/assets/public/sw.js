const CACHE_NAME = 'ogya-fire-v6';
const IMAGE_CACHE_NAME = 'ogya-images-v6';
const ACTIVE_CACHES = new Set([CACHE_NAME, IMAGE_CACHE_NAME]);

const CORE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/assets/aistudio/OGYA_SPECIAL_11_d4fab9c1.webp',
];

const IMAGE_HOST_ALLOWLIST = new Set([
  self.location.hostname,
  'images.unsplash.com',
  'res.cloudinary.com',
]);

function isImageRequest(req, url) {
  if (req.destination === 'image') return true;
  if (/\.(webp|png|jpe?g|gif|svg|ico)(\?.*)?$/i.test(url.pathname)) {
    return IMAGE_HOST_ALLOWLIST.has(url.hostname);
  }
  return false;
}

function isViteDevModuleRequest(url) {
  return (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/') ||
    url.searchParams.has('t') ||
    url.searchParams.has('v')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !ACTIVE_CACHES.has(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never intercept API routes, Vite dev modules, or Firebase Auth / Firestore / Google Identity traffic
  if (url.pathname.startsWith('/api/')) return;
  if (url.origin === self.location.origin && isViteDevModuleRequest(url)) return;
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('google.com')
  ) {
    return;
  }

  // 1. CacheFirst for images (local WebP assets, Cloudinary, Unsplash)
  if (isImageRequest(req, url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const networkRes = await fetch(req);
          if (networkRes && (networkRes.status === 200 || networkRes.type === 'opaque')) {
            cache.put(req, networkRes.clone()).catch(() => undefined);
          }
          return networkRes;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // Only handle same-origin app shell & static bundle requests from here
  if (url.origin !== self.location.origin) return;

  // 2. NetworkFirst with cached '/' fallback for HTML page navigations
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => undefined);
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/')) || Response.error())
    );
    return;
  }

  // 3. StaleWhileRevalidate for hashed production JS/CSS chunks and manifest
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      const networkPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(req, res.clone()).catch(() => undefined);
          }
          return res;
        })
        .catch(() => cached || Response.error());

      return cached || networkPromise;
    })
  );
});
