const version = "1.2.0";

/* https://wbaer.net/2022/05/setting-up-a-service-worker-with-hugo/ */
const BASE_CACHE_FILES = [
  '/css/main.min.css',
  '/css/bootstrap-grid.min.css',
  '/manifest.json',
  '/',
  '/posts/',
  '/writeups/htb/',
  '/writeups/thm/',
  '/android-chrome-512x512.png',
  '/android-chrome-192x192.png',
  '/apple-touch-icon.png',
  '/apple-touch-icon-180x180.png',
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-144x144.png',
  '/apple-touch-icon-120x120.png',
  '/apple-touch-icon-114x114.png',
  '/apple-touch-icon-76x76.png',
  '/apple-touch-icon-72x72.png',
  '/apple-touch-icon-60x60.png',
  '/apple-touch-icon-57x57.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/favicon.ico',
  '/mstile-150x150.png',
  '/fonts/jetbrains-mono-v12-latin-regular.woff',
  '/fonts/jetbrains-mono-v12-latin-regular.woff2',
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(`precache-${version}`)
      .then((cache) => {
        return cache.addAll(BASE_CACHE_FILES);
      })
      .then(self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const currentCaches = [`precache-${version}`, "runtime"];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return caches.open("runtime").then((cache) => {
            return fetch(event.request)
              .then((response) => {
                return cache.put(event.request, response.clone()).then(() => {
                  return response;
                });
              })
              .catch(() => {
                return caches.open(`precache-${version}`).then((cache) => {
                  console.log("Fetch failed; returning offline page instead.");
                  return cache.match("/offline/");
                });
                return new Response('Network error', {
                  status: 408,
                  headers: { 'Content-Type': 'text/plain' },
                });
              });
          });
        })
    );
  }
});