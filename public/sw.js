// =============================
// ⚡ Service Worker Gasolinera
// =============================

// 🔹 Cambia automáticamente en cada deploy (ejemplo con fecha/hora build)
const CACHE_NAME = "gasolinera-" + new Date().toISOString().slice(0,10);

// 🔹 Archivos estáticos a cachear
const URLS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/favicon.ico",
];

// ✅ Instalación y precache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting(); // Forzar instalación inmediata
});

// ✅ Activación y limpieza de caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();

  // 🔔 Avisar a clientes que hay nueva versión
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) =>
      client.postMessage({ type: "NEW_VERSION" })
    );
  });
});

// ✅ Estrategia de cache para peticiones
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 🔹 APIs dinámicas → Network First (si no hay red, usar cache)
  if (request.url.includes("/api/")) {
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

  // 🔹 Archivos estáticos → Cache First
  event.respondWith(
    caches.match(request).then((resp) => resp || fetch(request))
  );
});
