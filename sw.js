/* ============================================================
   PopUp Karaoke — Service Worker
   Caches core assets for fast load & basic offline support.
   ============================================================ */

const CACHE = 'puk-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/puklogo.webp',
  '/puklogo.png',
  '/puklogo.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/faq.html',
  '/blog/',
  '/blog/index.html',
  '/blog/karaoke-party-ideas-for-birthdays.html',
  '/blog/best-karaoke-songs-for-weddings.html',
  '/blog/how-to-hire-a-karaoke-dj.html',
  '/blog/karaoke-team-building-corporate-events.html'
];

/* Install: pre-cache core assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

/* Activate: clear old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch: cache-first for precached assets, network-first for everything else */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful HTML/CSS/JS/image responses
        if (response && response.status === 200) {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('text/html') || ct.includes('text/css') ||
              ct.includes('javascript') || ct.includes('image/')) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
        }
        return response;
      }).catch(() => {
        // Offline fallback: return homepage for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
