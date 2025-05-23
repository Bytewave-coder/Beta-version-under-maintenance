const CACHE_NAME = 'nexgen-ai-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/script.js',   // Added your new script
  '/manifest.json',
  '/Beta-version-under-maintenance/icons/android-chrome-192x192.png',
  '/Beta-version-under-maintenance/icons/android-chrome-512x512.png',
  '/Beta-version-under-maintenance/icons/apple-touch-icon.png',
  '/Beta-version-under-maintenance/icons/favicon-96x96.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install - pre-cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// Listen to 'skipWaiting' messages
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Fetch - respond from cache first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request).catch(() => caches.match('/index.html'))
    )
  );
});
