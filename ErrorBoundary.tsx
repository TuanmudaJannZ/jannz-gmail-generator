import { Component, ReactNode } from "react";
import { KEYS } from "./storage";

const T = {
  id: { title: "Terjadi kesalahan", body: "Aplikasi berhenti karena error tak terduga. Data Anda tidak dihapus.", reload: "Muat ulang", reset: "Reset pengaturan (riwayat tetap aman)", dump: "Unduh data mentah", detail: "Detail teknis" },
  en: { title: "Something went wrong", body: "The app stopped due to an unexpected error. Your data has not been deleted.", reload: "Reload", reset: "Reset settings (history stays safe)", dump: "Download raw data", detail: "Technical details" },
} as const;

/** Pengaman terakhir agar data rusak/error render tidak berujung layar kosong. Hanya pengaturan yang bisa direset; riwayat tidak pernah dihapus di sini. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error) { console.error("[JannZ] render error:", err); }
  private dump = () => {
    const o: Record<string, string | null> = {};
    try { Object.keys(localStorage).filter((k) => k.startsWith("jannz.")).forEach((k) => (o[k] = localStorage.getItem(k))); } catch { /* noop */ }
    const url = URL.createObjectURL(new Blob([JSON.stringify(o, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "jannz-raw-data.json"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };
  private reset = () => {
    try { const raw = localStorage.getItem(KEYS.settings); if (raw) localStorage.setItem("jannz.recovery." + KEYS.settings, raw); localStorage.removeItem(KEYS.settings); } catch { /* noop */ }
    location.reload();
  };
  render() {
    if (!this.state.err) return this.props.children;
    const l = T[(document.documentElement.lang || "id").startsWith("en") ? "en" : "id"];
    return (
      <div role="alert" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#04050B", color: "#E8ECFF", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 440, width: "100%", padding: 24, borderRadius: 20, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)" }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>{l.title}</h1>
          <p style={{ opacity: 0.75, fontSize: 14, lineHeight: 1.5 }}>{l.body}</p>
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {[[l.reload, () => location.reload()], [l.reset, this.reset], [l.dump, this.dump]].map(([t, f]) => (
              <button key={t as string} onClick={f as () => void} style={{ minHeight: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,.2)", background: "rgba(108,140,255,.18)", color: "inherit", fontSize: 14, cursor: "pointer" }}>{t as string}</button>
            ))}
          </div>
          <details style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}><summary>{l.detail}</summary><pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{String(this.state.err.message)}</pre></details>
        </div>
      </div>
    );
  }
}
