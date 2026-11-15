/* JannZ service worker — hanya cangkang aplikasi (HTML/JS/CSS/ikon). Tidak ada data email yang pernah masuk cache:
   data pengguna hidup di localStorage, dan permintaan non-GET atau lintas-origin tidak disentuh. */
const VERSION = "v13.0.0"; // ubah setiap rilis agar pembaruan terdeteksi
const CACHE = "jannz-" + VERSION;
const SHELL = ["/", "/manifest.webmanifest", "/favicon.svg", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {})); // tanpa skipWaiting otomatis
});
self.addEventListener("message", (e) => { if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("jannz-") && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // font Google dll. ditangani browser
  if (req.mode === "navigate") { // jaringan dulu (selalu versi terbaru), cache sebagai cadangan offline
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("/", copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match("/").then((r) => r || Response.error())));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async (c) => { // aset: stale-while-revalidate
    const hit = await c.match(req);
    const net = fetch(req).then((res) => { if (res.status === 200 && res.type === "basic") c.put(req, res.clone()).catch(() => {}); return res; }).catch(() => null);
    return hit || (await net) || Response.error();
  }));
});
