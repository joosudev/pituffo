const CACHE_NAME = "gasolinera-v1";
const URLS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/favicon.ico",
];

// Instalación y cacheo inicial
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activación y limpieza de caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Estrategia de cache: primero red, luego cache
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Para APIs dinámicas (registros, historial)
  if (request.url.includes("/api/registros") || request.url.includes("/api/historial")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Para archivos estáticos
  event.respondWith(
    caches.match(request).then((resp) => resp || fetch(request))
  );
});
