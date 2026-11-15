import { ReactNode } from "react";
import { useApp } from "./AppContext";
import { GlassCard } from "./GlassCard";
import { Counter } from "./Counter";

export function Stats() {
  const A = useApp();
  const { t } = A;
  const items: { label: string; node: ReactNode }[] = [
    { label: t("stat.original"), node: A.original ? <span className="mono text-sm break-all">{A.original}</span> : <span className="muted text-sm">—</span> },
    { label: t("stat.total"), node: <Counter value={A.total} /> },
    { label: t("stat.displayed"), node: <Counter value={A.rows.length} /> },
    { label: t("stat.selected"), node: <Counter value={A.selected.size} /> },
    { label: t("stat.copied"), node: <Counter value={A.copied} /> },
  ];
  return (
    <section aria-label={t("stat.stats")} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {items.map((it, i) => (
        <div key={i} className={i === 0 ? "col-span-2 lg:col-span-1" : ""}>
          <GlassCard delay={i * 0.06} className="p-4 h-full">
            <p className="muted text-xs uppercase tracking-wider mb-2">{it.label}</p>
            {A.loading ? <div className="skeleton h-7 w-3/4" /> : <div className="text-2xl font-display">{it.node}</div>}
          </GlassCard>
        </div>
      ))}
    </section>
  );
}
