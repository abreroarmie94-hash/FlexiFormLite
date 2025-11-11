const CACHE_NAME = 'ami-app-cache-v1';
// Ang `index.html` lang ang i-cache natin
// dahil ang CSS at JS ay nasa loob na niya.
const URLS_TO_CACHE = [
  'index.html'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Fetch event (Offline-first strategy)
self.addEventListener('fetch', event => {
  // Huwag i-cache ang mga tawag sa Google Apps Script
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para sa lahat ng iba (tulad ng index.html)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Ibigay mula sa cache kung nandoon,
        // kung wala, kunin sa network
        return response || fetch(event.request);
      })
  );
});

// Activate event (Clean up old caches)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
