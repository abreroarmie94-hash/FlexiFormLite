const CACHE_NAME = "flexiform-cache-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js"
];

// Install: cache basic files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(urlsToCache).catch(err => console.warn("Cache addAll failed", err))
    )
  );
});

// Fetch: try cache first, then network
self.addEventListener("fetch", event => {
  const reqUrl = event.request.url;

  // ⚠️ Always skip caching for dynamic requests (Google Apps Script backend)
  if (reqUrl.includes("script.google.com/macros")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response =>
      response ||
      fetch(event.request).then(fetchRes => {
        // Optionally cache new files dynamically
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      })
    )
  );
});

// Activate: clear old cache versions
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
