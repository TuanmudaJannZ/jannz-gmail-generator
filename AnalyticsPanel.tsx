import { useMemo } from "react";
import { useApp } from "./AppContext";
import { Counter } from "./Counter";
import { GlassCard } from "./GlassCard";
import { locale } from "./i18n";
import { dayKey, statsEmpty, type LogItem } from "./storage";

export function AnalyticsPanel() {
  const A = useApp(), { t, fmt, stats } = A;
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return { key: dayKey(d), label: d.toLocaleDateString(locale(A.settings.lang), { weekday: "short" }) }; }), [A.settings.lang, stats]); // eslint-disable-line react-hooks/exhaustive-deps
  const vals = days.map((d) => stats.daily[d.key]?.g ?? 0), max = Math.max(1, ...vals), sum = vals.reduce((a, b) => a + b, 0);
  const empty = statsEmpty(stats) && !A.favorites.length && !A.history.length;
  const cards: [string, number][] = [[t("stats.generated"), stats.generated], [t("stats.saved"), stats.saved], [t("stats.copied"), stats.copied], [t("stats.exported"), stats.exported], [t("stats.fav"), A.favorites.length], [t("stats.hist"), A.history.length]];
  const line = (l: LogItem) => t(`stats.k.${l.k}` as const, { n: fmt(l.n), d: l.d ?? "" });
  if (empty) return <GlassCard tilt={false} className="p-8 text-center muted">{t("stats.empty")}</GlassCard>;
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-3" aria-label={t("hub.tab.stats")}>
        {cards.map(([l, v]) => <GlassCard key={l} className="p-4"><p className="muted text-xs uppercase tracking-wider mb-2">{l}</p><div className="text-2xl font-display"><Counter value={v} /></div></GlassCard>)}
      </section>
      <GlassCard tilt={false} className="p-4">
        <p className="font-medium text-sm mb-3">{t("stats.chart")}</p>
        <div className="bars" role="img" aria-label={`${t("stats.chart")}: ${days.map((d, i) => `${d.label} ${fmt(vals[i])}`).join(", ")}`}>
          {days.map((d, i) => (
            <div key={d.key} className="bar-col" title={`${d.label}: ${fmt(vals[i])}`}>
              <span className="muted text-[10px]">{vals[i] ? fmt(vals[i]) : ""}</span>
              <i style={{ height: `${sum ? Math.max(vals[i] ? 6 : 2, (vals[i] / max) * 100) : 2}%` }} />
              <span className="muted text-[10px]">{d.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard tilt={false} className="p-4">
        <p className="font-medium text-sm mb-3">{t("stats.recent")}</p>
        {stats.log.length ? <ul className="space-y-2">{stats.log.map((l, i) => <li key={l.t + i} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate">{line(l)}</span><span className="muted text-xs shrink-0">{new Date(l.t).toLocaleString(locale(A.settings.lang), { dateStyle: "short", timeStyle: "short" })}</span></li>)}</ul> : <p className="muted text-sm">{t("stats.noLog")}</p>}
      </GlassCard>
    </div>
  );
}
