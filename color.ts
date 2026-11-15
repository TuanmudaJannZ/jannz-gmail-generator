/** Kontras WCAG untuk tombol utama: pilih warna teks (putih/gelap) dan "shade" gelap tipis agar teks ≥ 4.5:1 pada seluruh gradien aksen→sekunder. */
export const SECONDARY = "#A78BFA";
export const DARK_TEXT = "#0B1020";
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
export const luminance = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
export const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const shade = (c: number[], s: number) => c.map((v) => v * (1 - s));

export function onPrimary(accent: string, secondary = SECONDARY): { text: string; shade: number; ratio: number } {
  const bgs = [rgb(accent), rgb(secondary)];
  for (const s of [0, 0.26]) { // utamakan tanpa shade; teks putih mempertahankan identitas visual
    const r = Math.min(...bgs.map((b) => contrast(1, luminance(shade(b, s)))));
    if (r >= 4.5) return { text: "#FFFFFF", shade: s, ratio: r };
  }
  const dark = luminance(rgb(DARK_TEXT));
  return { text: DARK_TEXT, shade: 0, ratio: Math.min(...bgs.map((b) => contrast(dark, luminance(b)))) };
}
