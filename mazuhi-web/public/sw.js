// Service Worker DESACTIVADO - Fuerza actualización
// VERSIÓN: 3.0.0 - FORZAR LIMPIEZA

self.addEventListener('install', (event) => {
  // Skip waiting inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Eliminar TODOS los caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Eliminando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Tomar control
      self.clients.claim()
    ])
  );
});

// NO cachear nada - pasar todo directamente
self.addEventListener('fetch', (event) => {
  // Simplemente dejar que el navegador maneje todo normalmente
  return;
});