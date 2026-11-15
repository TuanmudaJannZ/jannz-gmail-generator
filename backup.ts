import { type Favorite, type HistoryItem, type Stats, MAX_FAV, SCHEMA_VERSION, sanitizeFavorites, sanitizeHistory, sanitizeStats } from "./storage";
import { type Settings, sanitizeSettings } from "./useSettings";

export const BACKUP_APP = "jannz-gmail-generator";
export const BACKUP_MAX_BYTES = 2 * 1024 * 1024;
export type Backup = { app: string; schema: number; exportedAt: string; kind: "full" | "config"; settings: Settings; history: HistoryItem[]; favorites?: Favorite[]; stats?: Stats };

export const buildBackup = (settings: Settings, history: HistoryItem[], favorites: Favorite[] = [], stats?: Stats): Backup =>
  ({ app: BACKUP_APP, schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(), kind: "full", settings, history, favorites, stats });
/** Konfigurasi saja: hanya pengaturan (tanpa riwayat, favorit, atau statistik). */
export const buildConfigBackup = (settings: Settings): Backup =>
  ({ app: BACKUP_APP, schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(), kind: "config", settings, history: [] });

export type Parsed = { ok: true; settings: Settings | null; history: HistoryItem[]; favorites: Favorite[]; stats: Stats | null; dropped: number } | { ok: false; reason: "size" | "json" | "format" | "version" };

/** Impor: ukuran dibatasi, JSON diparse (tanpa eval), dan semua field disanitasi. */
export function parseBackup(text: string): Parsed {
  if (text.length > BACKUP_MAX_BYTES) return { ok: false, reason: "size" };
  let j: unknown;
  try { j = JSON.parse(text); } catch { return { ok: false, reason: "json" }; }
  if (typeof j !== "object" || j === null || Array.isArray(j)) return { ok: false, reason: "format" };
  const o = j as Record<string, unknown>;
  if (o.app !== BACKUP_APP) return { ok: false, reason: "format" };
  if (typeof o.schema !== "number" || o.schema > SCHEMA_VERSION) return { ok: false, reason: "version" };
  const rawH = Array.isArray(o.history) ? o.history : [], rawF = Array.isArray(o.favorites) ? o.favorites : [];
  const history = sanitizeHistory(rawH) ?? [], favorites = sanitizeFavorites(rawF) ?? [];
  const dropped = Math.max(0, Math.min(rawH.length, 50) - history.length) + Math.max(0, Math.min(rawF.length, MAX_FAV) - favorites.length);
  return { ok: true, settings: o.settings === undefined ? null : sanitizeSettings(o.settings), history, favorites, stats: o.stats === undefined ? null : sanitizeStats(o.stats), dropped };
}

/** Gabungkan riwayat tanpa menghapus yang sudah ada (id unik; yang ada di perangkat menang), terbaru dulu, maks 50. */
export function mergeHistory(current: HistoryItem[], incoming: HistoryItem[]): HistoryItem[] {
  const ids = new Set(current.map((h) => h.id));
  return [...current, ...incoming.filter((h) => !ids.has(h.id))].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);
}
export function mergeFavorites(current: Favorite[], incoming: Favorite[]): Favorite[] {
  const seen = new Set(current.map((f) => f.email));
  return [...current, ...incoming.filter((f) => !seen.has(f.email))].sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_FAV);
}
