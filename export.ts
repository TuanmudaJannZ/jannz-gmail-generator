import { Row, variant } from "./gmail";
export const toTxt = (rows: Row[], numbered: boolean) => rows.map((r) => (numbered ? `${r.n}. ${r.email}` : r.email)).join("\n");
export const toCsv = (rows: Row[], numbered: boolean) =>
  [numbered ? "Number,Email" : "Email", ...rows.map((r) => (numbered ? `${r.n},${r.email}` : r.email))].join("\n");

/** Ekspor besar: dibuat bertahap (tiap 50.000 baris memberi napas ke UI) tanpa menyimpan semua baris di state. */
export async function buildParts(base: string, count: number, numbered: boolean, kind: "txt" | "csv"): Promise<string[]> {
  const parts: string[] = [];
  if (kind === "csv") parts.push((numbered ? "Number,Email" : "Email") + "\n");
  const STEP = 50000;
  for (let s = 0; s < count; s += STEP) {
    const e = Math.min(count, s + STEP), lines: string[] = [];
    for (let i = s + 1; i <= e; i++) { const em = variant(base, i); lines.push(numbered ? (kind === "csv" ? `${i},${em}` : `${i}. ${em}`) : em); }
    parts.push(lines.join("\n") + (e < count ? "\n" : ""));
    await new Promise((r) => setTimeout(r, 0));
  }
  return parts;
}

export function download(name: string, content: string | string[], mime: string) {
  const url = URL.createObjectURL(new Blob(Array.isArray(content) ? content : [content], { type: mime + ";charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function copyToClipboard(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select(); const ok = document.execCommand("copy"); t.remove(); return ok;
  }
}
