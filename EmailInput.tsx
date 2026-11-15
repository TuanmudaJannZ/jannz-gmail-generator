import { Mail, X } from "lucide-react";
import { useApp } from "./AppContext";
import { parseGmail } from "./gmail";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";

export function EmailInput() {
  const A = useApp();
  const { t, fmt } = A;
  const live = A.input ? parseGmail(A.input) : null;
  const submit = () => A.run(A.input, A.limit);
  return (
    <GlassCard tilt={false} className="p-4 sm:p-5">
      <label htmlFor="email" className="text-sm font-medium">{t("input.label")}</label>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <div className={`field flex-1 ${A.error ? "invalid" : ""}`}>
          <Mail size={18} className="muted shrink-0" />
          <input id="email" className="bare-input mono" type="email" inputMode="email" autoComplete="off" spellCheck={false} placeholder={t("input.placeholder")}
            value={A.input} aria-invalid={!!A.error} aria-describedby="email-msg"
            onChange={(e) => { A.setInput(e.target.value); if (A.error) A.setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          {A.input && <button className="icon-btn" aria-label={t("input.clear")} onClick={() => { A.setInput(""); A.setError(null); }}><X size={16} /></button>}
        </div>
        <Button variant="primary" loading={A.loading} onClick={submit}>{t("input.generate")}</Button>
      </div>
      <div id="email-msg" className="mt-2 min-h-5 text-sm">
        {A.error ? <p role="alert" className="text-red-400">{t(A.error.key, { n: A.error.n ?? 0 })}</p>
          : live?.ok ? <p className="muted">{t("input.original")}: <span className="mono text-[var(--accent)]">{live.original}</span></p>
          : <p className="muted">{t("input.hint")}</p>}
      </div>
      <div className="flex items-center gap-2 mt-2 text-sm">
        <label htmlFor="limit" className="muted">{t("input.chunk")}</label>
        <select id="limit" className="select" value={A.limit} onChange={(e) => A.setLimit(Number(e.target.value))}>
          {[100, 500, 1000, 5000, 25000].map((n) => <option key={n} value={n}>{fmt(n)}</option>)}
        </select>
      </div>
    </GlassCard>
  );
}
