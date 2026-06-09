self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Placeholder service worker for the PWA baseline.
  // Future offline caching and push handling will layer on top of this file.
});
