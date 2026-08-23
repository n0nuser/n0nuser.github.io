const version = "1.2.0";

/* https://wbaer.net/2022/05/setting-up-a-service-worker-with-hugo/ */

// Fingerprinted stylesheet path, injected at build time (see footer.html).
// The old hard-coded "/css/main.min.css" no longer exists and made every
// install fail (issue #62).
const MAIN_CSS_URL = "{{ .cssUrl }}";

const BASE_CACHE_FILES = [
    // Pages
    '/',
    '/posts/',
    '/writeups/htb/',
    '/offline/',
    // Files
    MAIN_CSS_URL,
    '/manifest.webmanifest',
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
            // Cache entries individually so one bad URL cannot reject the
            // whole installation; failures are logged instead of fatal.
            return Promise.allSettled(
                BASE_CACHE_FILES.map((url) => cache.add(url))
            ).then((results) => {
                results.forEach((result, index) => {
                    if (result.status === "rejected") {
                        console.error(
                            "Failed to precache:",
                            BASE_CACHE_FILES[index],
                            result.reason
                        );
                    }
                });
                return self.skipWaiting();
            });
        })
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
