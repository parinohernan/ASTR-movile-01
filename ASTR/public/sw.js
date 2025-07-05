// Service Worker mejorado para ASTR PWA
const CACHE_NAME = 'astr-v1.1';
const STATIC_CACHE = 'astr-static-v1';
const DYNAMIC_CACHE = 'astr-dynamic-v1';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/manifest.json',
  '/assets/images/icon.png',
  '/assets/images/logo.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔄 Instalando Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('✅ Cache estático abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Recursos cacheados exitosamente');
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Activando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activado');
      return self.clients.claim();
    })
  );
});

// Interceptación de peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia para archivos estáticos
  if (request.method === 'GET' && (
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname === '/' ||
    url.pathname === '/manifest.json'
  )) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response; // Retorna versión cacheada
          }
          return fetch(request)
            .then((fetchResponse) => {
              // Cachea la respuesta para futuras peticiones
              if (fetchResponse && fetchResponse.status === 200) {
                const responseToCache = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }
              return fetchResponse;
            });
        })
    );
  } else {
    // Estrategia Network First para API calls
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Si la petición es exitosa, la cacheamos
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentamos usar cache
          return caches.match(request);
        })
    );
  }
});

// Manejo de mensajes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 