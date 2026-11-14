export const MIN_LEN = 6;
export const MAX_LEN = 30;
export type Row = { n: number; email: string };
export type Parsed = { ok: true; base: string; original: string } | { ok: false; error: string };

export function parseGmail(raw: string): Parsed {
  const v = raw.trim().toLowerCase();
  if (!v) return { ok: false, error: "Masukkan alamat Gmail terlebih dahulu." };
  const m = v.match(/^([^@\s]+)@([^@\s]+)$/);
  if (!m) return { ok: false, error: "Format email tidak valid. Contoh: nama@gmail.com" };
  const [, user, domain] = m;
  if (domain !== "gmail.com") return { ok: false, error: "Hanya alamat @gmail.com yang didukung." };
  if (!/^[a-z0-9.]+$/.test(user)) return { ok: false, error: "Username hanya boleh berisi huruf, angka, dan titik." };
  if (user.startsWith(".") || user.endsWith(".") || user.includes("..")) return { ok: false, error: "Titik tidak boleh di awal, di akhir, atau berurutan." };
  const base = user.replace(/\./g, "");
  if (base.length < MIN_LEN) return { ok: false, error: `Username Gmail minimal ${MIN_LEN} karakter (tanpa titik).` };
  if (base.length > MAX_LEN) return { ok: false, error: `Username Gmail maksimal ${MAX_LEN} karakter (tanpa titik).` };
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

/** Lazy: hanya membuat `limit` hasil pertama, tidak pernah seluruh 2^(n-1). */
export function generate(base: string, limit: number): Row[] {
  const count = Math.min(totalVariations(base), limit);
  const rows: Row[] = new Array(count);
  for (let i = 1; i <= count; i++) rows[i - 1] = { n: i, email: variant(base, i) };
  return rows;
}
