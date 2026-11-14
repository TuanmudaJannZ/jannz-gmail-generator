import type { Row } from "./gmail";
export const toTxt = (rows: Row[], numbered: boolean) => rows.map((r) => (numbered ? `${r.n}. ${r.email}` : r.email)).join("\n");
export const toCsv = (rows: Row[], numbered: boolean) =>
  [numbered ? "Number,Email" : "Email", ...rows.map((r) => (numbered ? `${r.n},${r.email}` : r.email))].join("\n");
export function download(name: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime + ";charset=utf-8" }));
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
