/**
 * Registrasi service worker (hanya build produksi). Pembaruan tidak diterapkan otomatis: pengguna memilih "Muat ulang"
 * agar hasil yang belum disimpan tidak hilang tiba-tiba. `onUpdate` menerima fungsi yang menerapkan pembaruan.
 */
export function registerSW(onUpdate: (apply: () => void) => void) {
  if (!import.meta.env.PROD || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const hadController = !!navigator.serviceWorker.controller; // kunjungan pertama: jangan muat ulang saat clients.claim()
  const start = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const offer = (w: ServiceWorker) => onUpdate(() => w.postMessage({ type: "SKIP_WAITING" }));
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        w?.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) offer(w); });
      });
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
      document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
    } catch (e) { console.warn("[JannZ] service worker tidak aktif:", e); }
  };
  if (document.readyState === "complete") void start(); else addEventListener("load", () => void start(), { once: true });
}
