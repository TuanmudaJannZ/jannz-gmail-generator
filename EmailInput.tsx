import { Mail, X } from "lucide-react";
import { useApp } from "./AppContext";
import { parseGmail } from "./gmail";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";

export function EmailInput() {
  const A = useApp();
  const live = A.input ? parseGmail(A.input) : null;
  const submit = () => A.run(A.input, A.limit);
  return (
    <GlassCard tilt={false} className="p-4 sm:p-5">
      <label htmlFor="email" className="text-sm font-medium">Alamat Gmail</label>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <div className={`field flex-1 ${A.error ? "invalid" : ""}`}>
          <Mail size={18} className="muted shrink-0" />
          <input id="email" className="bare-input mono" type="email" inputMode="email" autoComplete="off" spellCheck={false} placeholder="namaanda@gmail.com"
            value={A.input} aria-invalid={!!A.error} aria-describedby="email-msg"
            onChange={(e) => { A.setInput(e.target.value); if (A.error) A.setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          {A.input && <button className="icon-btn" aria-label="Hapus input" onClick={() => { A.setInput(""); A.setError(""); }}><X size={16} /></button>}
        </div>
        <Button variant="primary" loading={A.loading} onClick={submit}>Generate</Button>
      </div>
      <div id="email-msg" className="mt-2 min-h-5 text-sm">
        {A.error ? <p role="alert" className="text-red-400">{A.error}</p>
          : live?.ok ? <p className="muted">Original: <span className="mono text-[var(--accent)]">{live.original}</span></p>
          : <p className="muted">Tekan Enter untuk generate. Hanya @gmail.com, 6–30 karakter.</p>}
      </div>
      <div className="flex items-center gap-2 mt-2 text-sm">
        <label htmlFor="limit" className="muted">Maksimum hasil</label>
        <select id="limit" className="select" value={A.limit} onChange={(e) => A.setLimit(Number(e.target.value))}>
          {[100, 500, 1000, 5000].map((n) => <option key={n} value={n}>{n.toLocaleString("id-ID")}</option>)}
        </select>
      </div>
    </GlassCard>
  );
}
