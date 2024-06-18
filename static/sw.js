const version = "1.0.0";

/* https://wbaer.net/2022/05/setting-up-a-service-worker-with-hugo/ */
const BASE_CACHE_FILES = [
    // Add URLs to the cache here
    '/',
    '/posts/',
    '/writeups/htb/',
    // Add files to the cache here
    '/css/main.min.css',
    '/manifest.json',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/favicon.ico',
    '/fonts/GeistVF.woff',
    '/fonts/jetbrains-mono-v12-latin-regular.woff',
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(`precache-${version}`).then((cache) => {
            return cache.addAll(BASE_CACHE_FILES).catch((error) => {
                console.error("Failed to cache:", error);
                throw error; // Ensure the error is propagated and the service worker installation fails
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    const currentCaches = [`precache-${version}`, "runtime"];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return cacheNames.filter(
                (cacheName) => !currentCaches.includes(cacheName)
            );
        }).then((cachesToDelete) => {
            return Promise.all(
                cachesToDelete.map((cacheToDelete) => {
                    return caches.delete(cacheToDelete);
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return caches.open("runtime").then((cache) => {
                    return fetch(event.request).then((response) => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    }).catch(() => {
                        return caches.open(`precache-${version}`).then((cache) => {
                            console.log("Fetch failed; returning offline page instead.");
                            return cache.match("/offline/");
                        });
                    });
                });
            })
        );
    }
});
