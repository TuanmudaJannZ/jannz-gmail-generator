import { parseGmail } from "./gmail";

export const SCHEMA_VERSION = 2;
export const KEYS = { settings: "jannz.settings", history: "jannz.history", schema: "jannz.schema", favorites: "jannz.favorites", stats: "jannz.stats" } as const;
export type HistoryItem = { id: string; original: string; total: number; limit: number; date: string };

const rec = (k: string) => "jannz.recovery." + k;

/** Baca JSON mentah. Bila JSON rusak, salinan mentahnya diamankan di `jannz.recovery.*` (tidak dihapus diam-diam). */
function readJson(key: string): { found: boolean; value?: unknown } {
  let raw: string | null = null;
  try { raw = localStorage.getItem(key); } catch { return { found: false }; }
  if (raw == null) return { found: false };
  try { return { found: true, value: JSON.parse(raw) }; } catch {
    try { localStorage.setItem(rec(key), raw); } catch { /* quota penuh: tetap lanjut dengan nilai bawaan */ }
    return { found: false };
  }
}

/** Muat + validasi. Struktur yang tidak sesuai ditolak oleh `validate` (mengembalikan null) dan diganti `fallback`. */
export function loadValidated<T>(key: string, fallback: T, validate: (v: unknown) => T | null): T {
  const r = readJson(key);
  if (!r.found) return fallback;
  const v = validate(r.value);
  if (v !== null) return v;
  try { localStorage.setItem(rec(key), JSON.stringify(r.value)); } catch { /* noop */ }
  return fallback;
}
export function load<T>(key: string, fallback: T): T {
  const r = readJson(key); return r.found ? (r.value as T) : fallback;
}
/** Mengembalikan false bila gagal (kuota penuh / diblokir) agar UI bisa memberi tahu pengguna. */
export function save(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
export function remove(key: string) { try { localStorage.removeItem(key); } catch { /* noop */ } }
export const hasRecovery = () => { try { return Object.keys(localStorage).some((k) => k.startsWith("jannz.recovery.")); } catch { return false; } };
export function clearRecovery() { try { Object.keys(localStorage).filter((k) => k.startsWith("jannz.recovery.")).forEach((k) => localStorage.removeItem(k)); } catch { /* noop */ } }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : null);

/** Sanitasi riwayat: setiap item harus alamat Gmail valid; item rusak dibuang, sisanya dipertahankan. Maks 50. */
export function sanitizeHistory(v: unknown): HistoryItem[] | null {
  if (!Array.isArray(v)) return null;
  const seen = new Set<string>(), out: HistoryItem[] = [];
  for (const x of v) {
    if (!isObj(x) || typeof x.id !== "string" || x.id.length === 0 || x.id.length > 40 || seen.has(x.id)) continue;
    if (typeof x.original !== "string") continue;
    const p = parseGmail(x.original); if (!p.ok) continue;
    const total = num(x.total, 0, Number.MAX_SAFE_INTEGER), limit = num(x.limit, 0, 200000);
    const d = typeof x.date === "string" ? new Date(x.date) : null;
    if (total === null || limit === null || !d || isNaN(d.getTime())) continue;
    seen.add(x.id); out.push({ id: x.id, original: p.original, total: Math.floor(total), limit: Math.floor(limit), date: d.toISOString() });
    if (out.length >= 50) break;
  }
  return out;
}

/** Migrasi skema berversi. Data dari versi lebih baru tidak disentuh. Aman dipanggil berulang. */
export function migrate() {
  const cur = load<number>(KEYS.schema, 1);
  if (typeof cur === "number" && cur > SCHEMA_VERSION) return;
  if (cur < 2) {
    // v1 -> v2: bentuk data sama, tetapi isinya divalidasi ulang dan item rusak dibuang.
    const h = loadValidated<HistoryItem[]>(KEYS.history, [], sanitizeHistory);
    if (localStorage.getItem(KEYS.history) !== null) save(KEYS.history, h);
  }
  save(KEYS.schema, SCHEMA_VERSION);
}

// ---------- Favorit & statistik (kunci tambahan; skema tetap v2 karena hanya menambah data) ----------
export type Favorite = { email: string; date: string; group: string };
export const MAX_FAV = 5000, MAX_GROUP = 24;
export const cleanGroup = (v: unknown) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, MAX_GROUP) : "");

export function sanitizeFavorites(v: unknown): Favorite[] | null {
  if (!Array.isArray(v)) return null;
  const seen = new Set<string>(), out: Favorite[] = [];
  for (const x of v) {
    if (!isObj(x) || typeof x.email !== "string") continue;
    const p = parseGmail(x.email); if (!p.ok) continue;
    const email = p.original; if (seen.has(email)) continue;
    const d = typeof x.date === "string" ? new Date(x.date) : null;
    seen.add(email); out.push({ email, date: d && !isNaN(d.getTime()) ? d.toISOString() : new Date(0).toISOString(), group: cleanGroup(x.group) });
    if (out.length >= MAX_FAV) break;
  }
  return out;
}

export type LogKind = "generate" | "copy" | "export" | "save" | "favorite";
export type LogItem = { t: string; k: LogKind; n: number; d?: string };
export type Day = { g: number; c: number; e: number };
export type Stats = { generated: number; saved: number; copied: number; exported: number; daily: Record<string, Day>; log: LogItem[] };
export const emptyStats = (): Stats => ({ generated: 0, saved: 0, copied: 0, exported: 0, daily: {}, log: [] });
const KINDS: readonly string[] = ["generate", "copy", "export", "save", "favorite"];
const cnt = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? Math.floor(Math.min(1e12, Math.max(0, x))) : 0);
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function sanitizeStats(v: unknown): Stats | null {
  if (!isObj(v)) return null;
  const daily: Record<string, Day> = {};
  if (isObj(v.daily)) for (const k of Object.keys(v.daily)) {
    const x = (v.daily as Record<string, unknown>)[k];
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && isObj(x)) daily[k] = { g: cnt(x.g), c: cnt(x.c), e: cnt(x.e) };
  }
  const keep = Object.keys(daily).sort().slice(-14), d2: Record<string, Day> = {};
  keep.forEach((k) => (d2[k] = daily[k]));
  const log: LogItem[] = [];
  if (Array.isArray(v.log)) for (const x of v.log) {
    if (!isObj(x) || typeof x.k !== "string" || !KINDS.includes(x.k) || typeof x.t !== "string" || isNaN(new Date(x.t).getTime())) continue;
    log.push({ t: new Date(x.t).toISOString(), k: x.k as LogKind, n: cnt(x.n), d: typeof x.d === "string" ? x.d.slice(0, 40) : undefined });
    if (log.length >= 20) break;
  }
  return { generated: cnt(v.generated), saved: cnt(v.saved), copied: cnt(v.copied), exported: cnt(v.exported), daily: d2, log };
}
export const statsEmpty = (s: Stats) => !(s.generated || s.saved || s.copied || s.exported || s.log.length);

/** Pemakaian localStorage milik aplikasi (perkiraan: 2 byte per karakter, seperti pada kebanyakan browser). */
export function localUsage() {
  let chars = 0, keys = 0;
  try { for (const k of Object.keys(localStorage)) if (k.startsWith("jannz.")) { keys++; chars += k.length + (localStorage.getItem(k)?.length ?? 0); } } catch { /* noop */ }
  return { bytes: chars * 2, keys };
}
export function recoveryDump(): string {
  const o: Record<string, string | null> = {};
  try { Object.keys(localStorage).filter((k) => k.startsWith("jannz.recovery.")).forEach((k) => (o[k] = localStorage.getItem(k))); } catch { /* noop */ }
  return JSON.stringify(o, null, 2);
}
