import { ShieldCheck } from "lucide-react";
import { GlassCard } from "./GlassCard";
export function Disclaimer() {
  return (
    <GlassCard tilt={false} className="p-4 flex gap-3 text-sm">
      <ShieldCheck className="shrink-0 text-[var(--accent)]" size={20} />
      <p className="muted">
        <b className="text-[var(--text)]">Penting:</b> variasi titik Gmail <b>bukan akun baru</b> dan <b>bukan inbox independen</b> — semuanya masuk ke inbox yang sama dengan alamat aslinya.
        Semua proses berjalan lokal di browser; email Anda tidak dikirim ke server mana pun.
      </p>
    </GlassCard>
  );
}
