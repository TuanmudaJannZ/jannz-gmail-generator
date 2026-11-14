import { memo, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Copy, FileSpreadsheet, FileText, Save, Search } from "lucide-react";
import { useApp } from "./AppContext";
import { useDebounced } from "./useDebounced";
import type { Row } from "./gmail";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";

const PAGE = 20;

const CopyBtn = ({ onCopy }: { onCopy: () => Promise<boolean> }) => {
  const [ok, setOk] = useState(false);
  return (
    <button className={`icon-btn copy-btn ${ok ? "ok" : ""}`} aria-label="Salin email" onClick={async () => { if (await onCopy()) { setOk(true); setTimeout(() => setOk(false), 1200); } }}>
      {ok ? <motion.span initial={{ scale: 0.3, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} className="flex"><Check size={16} /></motion.span> : <Copy size={16} />}
      {ok && <i className="burst" />}
    </button>
  );
};

const ResultRow = memo(function ResultRow({ row, checked, delay, onToggle, onCopy }: { row: Row; checked: boolean; delay: number; onToggle: (n: number) => void; onCopy: (t: string, c: number) => Promise<boolean> }) {
  return (
    <motion.li initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }} className={`row glass-lite ${checked ? "selected" : ""}`}>
      <label className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer">
        <input type="checkbox" className="check" checked={checked} onChange={() => onToggle(row.n)} aria-label={`Pilih ${row.email}`} />
        <span className="muted text-xs w-10 shrink-0">#{row.n}</span>
        <span className="mono text-sm truncate">{row.email}</span>
      </label>
      {checked && <span className="chip">Selected</span>}
      <CopyBtn onCopy={() => onCopy(row.email, 1)} />
    </motion.li>
  );
});

export function Results() {
  const A = useApp();
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
    if (sort === "az") r = [...r].sort((a, b) => a.email.localeCompare(b.email));
    return r;
  }, [A.rows, A.selected, dq, filter, sort]);
  useEffect(() => setPage(1), [dq, sort, filter, A.rows]);

  const pages = Math.max(1, Math.ceil(view.length / PAGE)), cur = Math.min(page, pages);
  const slice = view.slice((cur - 1) * PAGE, cur * PAGE);
  const k = A.settings.reduceMotion ? 0 : A.settings.intensity;
  const lines = (rows: Row[]) => rows.map((r) => r.email).join("\n");

  if (A.loading) return (
    <GlassCard tilt={false} aria-busy={true} className="p-4 space-y-3">
      {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-12 w-full" />)}
    </GlassCard>
  );
  if (!A.rows.length) return <GlassCard tilt={false} className="p-8 text-center muted">Belum ada hasil. Masukkan alamat Gmail lalu tekan Generate.</GlassCard>;
  const selRows = A.rows.filter((r) => A.selected.has(r.n));
  return (
    <GlassCard tilt={false} className="p-4 sm:p-5">
      <p className="muted text-sm mb-3">Menampilkan <b className="text-[var(--text)]">{A.rows.length.toLocaleString("id-ID")}</b> dari <b className="text-[var(--text)]">{A.total.toLocaleString("id-ID")}</b> variasi{A.total > A.rows.length && " (dibatasi maksimum hasil)"}.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="field flex-1 min-w-[160px]"><Search size={16} className="muted" /><input className="bare-input mono text-sm" placeholder="Cari hasil…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari hasil" /></div>
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filter"><option value="all">Semua</option><option value="sel">Terpilih</option><option value="unsel">Belum dipilih</option></select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Urutkan"><option value="asc">Urutan 1→N</option><option value="desc">Urutan N→1</option><option value="az">A–Z</option></select>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button onClick={() => A.selectMany(view.map((r) => r.n))}>Select All</Button>
        <Button onClick={A.deselectAll} disabled={!A.selected.size}>Deselect All</Button>
        <Button variant="primary" disabled={!selRows.length} onClick={() => A.copy(lines(selRows), selRows.length)}>Copy Selected ({A.selected.size})</Button>
        <Button onClick={() => A.copy(lines(A.rows), A.rows.length)}>Copy All</Button>
        <Button onClick={A.saveHistory}><Save size={16} />Simpan ke History</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <Button onClick={() => A.exportRows("txt", numbered)}><FileText size={16} />TXT</Button>
        <Button onClick={() => A.exportRows("csv", numbered)}><FileSpreadsheet size={16} />CSV</Button>
        <label className="flex items-center gap-2 muted cursor-pointer"><input type="checkbox" className="check" checked={numbered} onChange={(e) => setNumbered(e.target.checked)} />Sertakan nomor urut</label>
        <span className="muted">· ekspor {A.selected.size ? "hasil terpilih" : "semua hasil"}</span>
      </div>
      <ul className="space-y-2" aria-label="Daftar hasil">
        {slice.map((r, i) => <ResultRow key={r.n} row={r} checked={A.selected.has(r.n)} delay={i * 0.025 * k} onToggle={A.toggle} onCopy={A.copy} />)}
        {!slice.length && <li className="muted text-center p-6 text-sm">Tidak ada hasil yang cocok.</li>}
      </ul>
      <div className="flex items-center justify-between mt-4">
        <Button disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label="Halaman sebelumnya"><ChevronLeft size={16} /></Button>
        <span className="muted text-sm">Halaman {cur} / {pages} · {view.length.toLocaleString("id-ID")} hasil</span>
        <Button disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label="Halaman berikutnya"><ChevronRight size={16} /></Button>
      </div>
    </GlassCard>
  );
}
