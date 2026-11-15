export const MIN_LEN = 6;
export const MAX_LEN = 30;
export const MAX_LOADED = 200000; // batas hasil di memori/layar
export const EXPORT_MAX = 1000000; // batas ekspor bertahap
export type Row = { n: number; email: string };
export type ParseErr = { key: "err.empty" | "err.format" | "err.domain" | "err.chars" | "err.dots" | "err.min" | "err.max"; n?: number };
export type Parsed = { ok: true; base: string; original: string } | { ok: false; err: ParseErr };

export function parseGmail(raw: string): Parsed {
  const v = raw.trim().toLowerCase();
  if (!v) return { ok: false, err: { key: "err.empty" } };
  const m = v.match(/^([^@\s]+)@([^@\s]+)$/);
  if (!m) return { ok: false, err: { key: "err.format" } };
  const [, user, domain] = m;
  if (domain !== "gmail.com") return { ok: false, err: { key: "err.domain" } };
  if (!/^[a-z0-9.]+$/.test(user)) return { ok: false, err: { key: "err.chars" } };
  if (user.startsWith(".") || user.endsWith(".") || user.includes("..")) return { ok: false, err: { key: "err.dots" } };
  const base = user.replace(/\./g, "");
  if (base.length < MIN_LEN) return { ok: false, err: { key: "err.min", n: MIN_LEN } };
  if (base.length > MAX_LEN) return { ok: false, err: { key: "err.max", n: MAX_LEN } };
  return { ok: true, base, original: `${user}@gmail.com` };
}

/** Variasi bertitik (tanpa alamat tanpa-titik): 2^(n-1) - 1. n <= 30 sehingga aman sebagai Number. */
export const totalVariations = (base: string) => 2 ** (base.length - 1) - 1;

/** Variasi ke-index (1..total): bit ke-(i-1) = titik sebelum karakter ke-i. Unik, urutan asli, tanpa titik di tepi/berurutan. */
export function variant(base: string, index: number): string {
  let out = base[0];
  for (let i = 1; i < base.length; i++) {
    if (Math.floor(index / 2 ** (i - 1)) % 2 === 1) out += ".";
    out += base[i];
  }
  return out + "@gmail.com";
}

/** Lazy: membuat `limit` hasil mulai setelah `offset` (untuk "muat lagi"), tidak pernah seluruh 2^(n-1). */
export function generate(base: string, limit: number, offset = 0): Row[] {
  const count = Math.max(0, Math.min(totalVariations(base) - offset, limit));
  const rows: Row[] = new Array(count);
  for (let i = 1; i <= count; i++) rows[i - 1] = { n: offset + i, email: variant(base, offset + i) };
  return rows;
}
