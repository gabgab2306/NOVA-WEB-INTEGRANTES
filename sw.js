const CACHE_NAME = "nova-shell-v1";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/nova-icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).catch(() => undefined));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).then(response => {
      if (response.ok && new URL(req.url).pathname === "/") {
        const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put("/", copy));
      }
      return response;
    }).catch(async () => (await caches.match(req)) || (await caches.match("/index.html")) || Response.error()));
    return;
  }
  const url = new URL(req.url);
  if (url.pathname === "/manifest.webmanifest" || url.pathname === "/icons/nova-icon.svg") {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
  }
});