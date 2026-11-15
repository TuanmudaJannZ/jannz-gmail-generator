import { type Row, variant } from "./gmail";
import type { Favorite, HistoryItem } from "./storage";

export type ExportKind = "txt" | "csv" | "json";
export type ExportSource = "selected" | "loaded" | "all" | "favorites" | "history";
export const MIME: Record<ExportKind, string> = { txt: "text/plain", csv: "text/csv", json: "application/json" };

/** Sel CSV aman: kutip bila perlu, dan netralkan awalan rumus (=, +, -, @) agar tidak dieksekusi spreadsheet. */
const csvCell = (v: string | number) => { let s = String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export const toTxt = (rows: Row[], numbered: boolean) => rows.map((r) => (numbered ? `${r.n}. ${r.email}` : r.email)).join("\n");
export const toCsv = (rows: Row[], numbered: boolean) =>
  [numbered ? "Number,Email" : "Email", ...rows.map((r) => (numbered ? `${r.n},${r.email}` : r.email))].join("\n");
export const toJson = (rows: Row[], numbered: boolean) => JSON.stringify(rows.map((r) => (numbered ? { n: r.n, email: r.email } : { email: r.email })), null, 2);
export function serializeRows(rows: Row[], numbered: boolean, kind: ExportKind) { return kind === "txt" ? toTxt(rows, numbered) : kind === "csv" ? toCsv(rows, numbered) : toJson(rows, numbered); }

export function serializeFavorites(f: Favorite[], kind: ExportKind) {
  if (kind === "txt") return f.map((x) => x.email).join("\n");
  if (kind === "csv") return ["Email,Group,Added", ...f.map((x) => [x.email, x.group, x.date].map(csvCell).join(","))].join("\n");
  return JSON.stringify(f.map((x) => ({ email: x.email, group: x.group, added: x.date })), null, 2);
}
export function serializeHistory(h: HistoryItem[], kind: ExportKind) {
  if (kind === "txt") return h.map((x) => x.original).join("\n");
  if (kind === "csv") return ["Original,TotalVariations,SavedRows,Date", ...h.map((x) => [x.original, x.total, x.limit, x.date].map(csvCell).join(","))].join("\n");
  return JSON.stringify(h.map((x) => ({ original: x.original, totalVariations: x.total, savedRows: x.limit, date: x.date })), null, 2);
}

export const BIG_EXPORT_BYTES = 50 * 1024 * 1024; // di atas ini pengguna diminta konfirmasi
const CHUNK = 25000;

/** Perkiraan ukuran file (byte) untuk variasi 1..count dari satu basis. Rata-rata titik dihitung dari bit yang dipakai indeks. */
export function estimateBytes(base: string, count: number, numbered: boolean, kind: ExportKind) {
  const n = base.length, bits = Math.min(n - 1, Math.ceil(Math.log2(count + 1)));
  const email = n + bits / 2 + 10, digits = String(count).length;
  if (kind === "json") return Math.round(count * (email + (numbered ? 19 + digits : 14)) + 4);
  return Math.round(count * (email + 1 + (numbered ? (kind === "csv" ? digits + 1 : digits + 2) : 0)) + (kind === "csv" ? 20 : 0));
}
/** Perkiraan ukuran dari daftar yang sudah ada di memori. */
export function listBytes(items: { email: string }[], numbered: boolean, kind: ExportKind, extra = 0) {
  let c = 0; for (const x of items) c += x.email.length; const digits = String(items.length).length;
  const per = kind === "json" ? (numbered ? 19 + digits : 14) : 1 + (numbered ? (kind === "csv" ? digits + 1 : digits + 2) : 0);
  return Math.round(c + items.length * (per + extra));
}
export function fmtBytes(b: number) { return b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(b < 10 * 1024 * 1024 ? 1 : 0)} MB`; }

/**
 * Ekspor besar per potongan: tiap potongan langsung dijadikan Blob kecil sehingga string-nya bisa dilepas GC
 * (browser dapat menyimpan Blob di luar heap JS). Mendukung progress dan pembatalan lewat AbortSignal.
 */
export async function buildBlob(base: string, count: number, numbered: boolean, kind: ExportKind, onProgress?: (p: number) => void, signal?: AbortSignal): Promise<Blob> {
  const parts: Blob[] = [];
  if (kind === "csv") parts.push(new Blob([(numbered ? "Number,Email" : "Email") + "\n"]));
  if (kind === "json") parts.push(new Blob(["[\n"]));
  const sep = kind === "json" ? ",\n" : "\n";
  for (let s = 0; s < count; s += CHUNK) {
    if (signal?.aborted) throw new DOMException("Export dibatalkan", "AbortError");
    const e = Math.min(count, s + CHUNK), lines: string[] = [];
    for (let i = s + 1; i <= e; i++) {
      const em = variant(base, i);
      lines.push(kind === "json" ? (numbered ? `{"n":${i},"email":"${em}"}` : `{"email":"${em}"}`) : numbered ? (kind === "csv" ? `${i},${em}` : `${i}. ${em}`) : em);
    }
    parts.push(new Blob([lines.join(sep) + (e < count ? sep : "")]));
    onProgress?.(e / count);
    await new Promise((r) => setTimeout(r, 0));
  }
  if (kind === "json") parts.push(new Blob(["\n]"]));
  if (signal?.aborted) throw new DOMException("Export dibatalkan", "AbortError");
  return new Blob(parts, { type: MIME[kind] + ";charset=utf-8" });
}

export function download(name: string, content: string | string[] | Blob, mime: string) {
  const blob = content instanceof Blob ? content : new Blob(Array.isArray(content) ? content : [content], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000); // beri waktu unduhan besar dimulai sebelum URL dicabut
}
export async function copyToClipboard(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select(); const ok = document.execCommand("copy"); t.remove(); return ok;
  }
}
