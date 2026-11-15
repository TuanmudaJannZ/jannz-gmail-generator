import { memo, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, FileSpreadsheet, FileText, Plus, Save, Search } from "lucide-react";
import { useApp } from "./AppContext";
import { useDebounced } from "./useDebounced";
import { EXPORT_MAX, MAX_LOADED, Row } from "./gmail";
import type { TFn } from "./i18n";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";

const PAGE = 20;

const CopyBtn = ({ onCopy, label }: { onCopy: () => Promise<boolean>; label: string }) => {
  const [ok, setOk] = useState(false);
  return (
    <button className={`icon-btn copy-btn ${ok ? "ok" : ""}`} aria-label={label} onClick={async () => { if (await onCopy()) { setOk(true); setTimeout(() => setOk(false), 1200); } }}>
      {ok ? <motion.span initial={{ scale: 0.3, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} className="flex"><Check size={16} /></motion.span> : <Copy size={16} />}
      {ok && <i className="burst" />}
    </button>
  );
};

const ResultRow = memo(function ResultRow({ row, checked, delay, onToggle, onCopy, t }: { row: Row; checked: boolean; delay: number; onToggle: (n: number) => void; onCopy: (t: string, c: number) => Promise<boolean>; t: TFn }) {
  return (
    <li style={delay ? ({ "--d": `${delay.toFixed(3)}s` } as CSSProperties) : undefined} className={`row glass-lite enter ${checked ? "selected" : ""}`}>
      <label className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer">
        <input type="checkbox" className="check" checked={checked} onChange={() => onToggle(row.n)} aria-label={t("res.pick", { email: row.email })} />
        <span className="muted text-xs w-12 shrink-0">#{row.n}</span>
        <span className="mono text-sm truncate">{row.email}</span>
      </label>
      {checked && <span className="chip">{t("res.badge")}</span>}
      <CopyBtn label={t("res.copyOne")} onCopy={() => onCopy(row.email, 1)} />
    </li>
  );
});

export function Results() {
  const A = useApp();
  const { t, fmt } = A;
  const [q, setQ] = useState(""), dq = useDebounced(q.trim().toLowerCase(), 200);
  const [sort, setSort] = useState<"asc" | "desc" | "az">("asc");
  const [filter, setFilter] = useState<"all" | "sel" | "unsel">("all");
  const [page, setPage] = useState(1);
  const [numbered, setNumbered] = useState(true);

  const view = useMemo(() => {
    let r = A.rows;
    if (dq) r = r.filter((x) => x.email.includes(dq));
    if (filter === "sel") r = r.filter((x) => A.selected.has(x.n));
    if (filter === "unsel") r = r.filter((x) => !A.selected.has(x.n));
    if (sort === "desc") r = [...r].reverse();
    if (sort === "az") r = [...r].sort((a, b) => (a.email < b.email ? -1 : a.email > b.email ? 1 : 0));
    return r;
  }, [A.rows, A.selected, dq, filter, sort]);
  useEffect(() => setPage(1), [dq, sort, filter]);

  const pages = Math.max(1, Math.ceil(view.length / PAGE)), cur = Math.min(page, pages);
  const slice = view.slice((cur - 1) * PAGE, cur * PAGE);
  const k = A.settings.reduceMotion ? 0 : A.settings.intensity;
  const lines = (rows: Row[]) => rows.map((r) => r.email).join("\n");

  if (A.loading) return (
    <GlassCard tilt={false} aria-busy={true} className="p-4 sm:p-5">
      <div className="skeleton h-5 w-56 max-w-full mb-3" />
      <div className="flex flex-wrap gap-2 mb-3"><div className="skeleton h-12 flex-1 min-w-[160px]" /><div className="skeleton h-12 w-28" /><div className="skeleton h-12 w-28" /></div>
      <div className="flex flex-wrap gap-2 mb-3">{[28, 32, 40, 32, 28].map((w, i) => <div key={i} className="skeleton h-11" style={{ width: w * 4 }} />)}</div>
      <div className="flex flex-wrap items-center gap-2 mb-4"><div className="skeleton h-11 w-24" /><div className="skeleton h-11 w-24" /><div className="skeleton h-5 w-40" /></div>
      <ul className="space-y-2" aria-hidden="true">{Array.from({ length: PAGE }, (_, i) => <li key={i} className="skeleton row-skel" />)}</ul>
      <div className="flex items-center justify-between mt-4"><div className="skeleton h-11 w-14" /><div className="skeleton h-4 w-40" /><div className="skeleton h-11 w-14" /></div>
      <div className="load-more"><div className="skeleton h-11 w-48 mx-auto" /><div className="skeleton h-4 w-40 mx-auto mt-2" /></div>
      <div className="export-all"><div className="skeleton h-5 w-44 max-w-full" /><div className="skeleton h-4 w-64 max-w-full mt-0 mb-2" /><div className="seg"><div className="skeleton h-11" /><div className="skeleton h-11" /></div></div>
    </GlassCard>
  );
  if (!A.rows.length) return <GlassCard tilt={false} className="p-8 text-center muted">{t("res.empty")}</GlassCard>;

  const selRows = A.rows.filter((r) => A.selected.has(r.n));
  const remaining = A.total - A.rows.length;
  const capped = A.rows.length >= MAX_LOADED;
  const nextChunk = Math.min(A.limit, MAX_LOADED - A.rows.length, remaining);
  return (
    <GlassCard tilt={false} className="p-4 sm:p-5">
      <div className="reveal">
      <p className="muted text-sm mb-3">{t("res.showing", { shown: fmt(A.rows.length), total: fmt(A.total) })}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="field flex-1 min-w-[160px]"><Search size={16} className="muted" /><input className="bare-input mono text-sm" placeholder={t("res.search")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t("res.search")} /></div>
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label={t("res.filter")}><option value="all">{t("res.all")}</option><option value="sel">{t("res.sel")}</option><option value="unsel">{t("res.unsel")}</option></select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={t("res.sort")}><option value="asc">{t("res.asc")}</option><option value="desc">{t("res.desc")}</option><option value="az">{t("res.az")}</option></select>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button onClick={() => A.selectMany(view.map((r) => r.n))}>{t("res.selectAll")}</Button>
        <Button onClick={A.deselectAll} disabled={!A.selected.size}>{t("res.deselectAll")}</Button>
        <Button variant="primary" disabled={!selRows.length} onClick={() => A.copy(lines(selRows), selRows.length)}>{t("res.copySelected", { n: fmt(A.selected.size) })}</Button>
        <Button onClick={() => A.copy(lines(A.rows), A.rows.length)}>{t("res.copyAll")}</Button>
        <Button onClick={A.saveHistory}><Save size={16} />{t("res.save")}</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <Button onClick={() => A.exportRows("txt", numbered)}><FileText size={16} />TXT</Button>
        <Button onClick={() => A.exportRows("csv", numbered)}><FileSpreadsheet size={16} />CSV</Button>
        <label className="flex items-center gap-2 muted cursor-pointer"><input type="checkbox" className="check" checked={numbered} onChange={(e) => setNumbered(e.target.checked)} />{t("res.numbered")}</label>
        <span className="muted">· {A.selected.size ? t("res.exportSel") : t("res.exportLoaded")}</span>
      </div>
      <ul className="space-y-2" aria-label={t("res.list")}>
        {slice.map((r, i) => <ResultRow key={r.n} row={r} checked={A.selected.has(r.n)} delay={i * 0.02 * k} onToggle={A.toggle} onCopy={A.copy} t={t} />)}
        {!slice.length && <li className="muted text-center p-6 text-sm">{t("res.none")}</li>}
      </ul>
      <div className="flex items-center justify-between mt-4">
        <Button disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label={t("res.prev")}><ChevronLeft size={16} /></Button>
        <span className="muted text-sm text-center">{t("res.page", { cur: fmt(cur), pages: fmt(pages), n: fmt(view.length) })}</span>
        <Button disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label={t("res.next")}><ChevronRight size={16} /></Button>
      </div>

      <div className="load-more">
        {remaining > 0 && !capped ? (
          <>
            <Button variant="primary" onClick={A.loadMore}><Plus size={16} />{t("res.loadMore", { n: fmt(nextChunk) })}</Button>
            <p className="muted text-xs mt-2">{t("res.remaining", { n: fmt(remaining) })}</p>
          </>
        ) : remaining > 0 ? <p className="muted text-xs">{t("res.capNote", { max: fmt(MAX_LOADED) })}</p>
          : <p className="muted text-xs">{t("res.allLoaded")}</p>}
      </div>

      <div className="export-all">
        <p className="font-medium text-sm">{t("res.exportAllTitle")}</p>
        <p className="muted text-xs mb-2">{t("res.exportAllNote", { max: fmt(EXPORT_MAX) })}</p>
        <div className="seg">
          <Button loading={A.exporting} onClick={() => A.exportAll("txt", numbered)}><FileText size={16} />{t("res.exportAllBtn", { kind: "TXT" })}</Button>
          <Button loading={A.exporting} onClick={() => A.exportAll("csv", numbered)}><FileSpreadsheet size={16} />{t("res.exportAllBtn", { kind: "CSV" })}</Button>
        </div>
      </div>
      </div>
    </GlassCard>
  );
}
