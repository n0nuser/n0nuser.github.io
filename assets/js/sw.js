const version = "1.3.0";

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

// Runtime cache is versioned too, so bumping `version` clears it on activate.
// It used to be a fixed "runtime" name that survived every deploy.
const RUNTIME_CACHE = `runtime-${version}`;

self.addEventListener("activate", (event) => {
    const currentCaches = [`precache-${version}`, RUNTIME_CACHE];
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

// Store only complete, successful same-origin responses (never 404s or errors).
function putInRuntime(request, response) {
    if (!response || !response.ok || response.type !== "basic") {
        return Promise.resolve(response);
    }
    const copy = response.clone();
    return caches.open(RUNTIME_CACHE)
        .then((cache) => cache.put(request, copy))
        .then(() => response, () => response);
}

function offlinePage() {
    return caches.open(`precache-${version}`).then((cache) => {
        console.log("Fetch failed; returning offline page instead.");
        return cache.match("/offline/");
    });
}

// Pages and data (HTML, search index JSON, feeds, manifest): network first,
// so a deploy is visible on the next visit. The cache is only an offline fallback.
function networkFirst(request) {
    return fetch(request)
        .then((response) => putInRuntime(request, response))
        .catch(() => caches.match(request).then((cached) => {
            if (cached) {
                return cached;
            }
            // Only navigations get the HTML offline page; data requests just fail
            return request.mode === "navigate" ? offlinePage() : Response.error();
        }));
}

// Static assets (fingerprinted CSS/JS, fonts, images): cache first.
// Fingerprinted URLs change when their content changes, so this is safe.
function cacheFirst(request) {
    return caches.match(request).then((cached) => {
        if (cached) {
            return cached;
        }
        return fetch(request)
            .then((response) => putInRuntime(request, response))
            .catch(() => Response.error());
    });
}

const STATIC_DESTINATIONS = ["style", "script", "font", "image"];

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
        return;
    }
    event.respondWith(
        STATIC_DESTINATIONS.includes(request.destination) ? cacheFirst(request) : networkFirst(request)
    );
});
