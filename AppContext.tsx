import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { EXPORT_MAX, generate, MAX_LOADED, parseGmail, ParseErr, Row, totalVariations } from "./gmail";
import { buildParts, copyToClipboard, download, toCsv, toTxt } from "./export";
import { load, remove, save } from "./storage";
import { play, Sfx } from "./sound";
import { Settings, useSettings } from "./useSettings";
import { locale, makeT } from "./i18n";

export type ToastType = "success" | "error" | "warning" | "info";
export type Page = "home" | "generator" | "history" | "settings";
export type HistoryItem = { id: string; original: string; total: number; limit: number; date: string };

function useStore() {
  const [settings, updateSettings, resetSettings] = useSettings();
  const [page, setPage] = useState<Page>("home");
  const [input, setInput] = useState("");
  const [error, setError] = useState<ParseErr | null>(null);
  const [original, setOriginal] = useState("");
  const [base, setBase] = useState("");
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(500);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>(() => load<HistoryItem[]>("jannz.history", []));
  const [toastMsg, setToastMsg] = useState<{ id: number; text: string; type: ToastType } | null>(null);

  const t = useMemo(() => makeT(settings.lang), [settings.lang]);
  const fmt = useCallback((n: number) => n.toLocaleString(locale(settings.lang)), [settings.lang]);
  const sRef = useRef<Settings>(settings); sRef.current = settings;
  const tRef = useRef(t); tRef.current = t;
  const fmtRef = useRef(fmt); fmtRef.current = fmt;
  const rowsRef = useRef<Row[]>([]); rowsRef.current = rows;
  const selRef = useRef<Set<number>>(selected); selRef.current = selected;
  const baseRef = useRef(""); baseRef.current = base;
  const totalRef = useRef(0); totalRef.current = total;
  const limitRef = useRef(500); limitRef.current = limit;
  const timer = useRef<number>();

  // Satu toast aktif; pesan identik hanya memperpanjang waktu tampil (tanpa animasi ulang / penumpukan).
  const toast = useCallback((text: string, type: ToastType = "success") => {
    setToastMsg((p) => (p && p.text === text && p.type === type ? p : { id: Date.now(), text, type }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMsg(null), type === "error" || type === "warning" ? 3800 : 2400);
  }, []);
  const sfx = useCallback((k: Sfx) => { if (sRef.current.sound) play(k); }, []);
  const go = useCallback((p: Page) => { sfx("nav"); setPage(p); window.scrollTo(0, 0); }, [sfx]);

  const run = useCallback((raw: string, lim: number) => {
    const p = parseGmail(raw);
    if (!p.ok) { setError(p.err); return false; }
    setError(null); setLoading(true); setPage("generator"); setOriginal(p.original); setBase(p.base);
    window.setTimeout(() => {
      setTotal(totalVariations(p.base)); setRows(generate(p.base, lim)); setSelected(new Set()); setLoading(false); sfx("done");
    }, 380);
    return true;
  }, [sfx]);

  const loadMore = useCallback(() => {
    const cur = rowsRef.current.length;
    const room = Math.min(MAX_LOADED - cur, totalRef.current - cur, limitRef.current);
    if (room <= 0 || !baseRef.current) return;
    const more = generate(baseRef.current, room, cur);
    setRows((r) => r.concat(more));
    toast(tRef.current("toast.loaded", { n: fmtRef.current(more.length) }), "info");
  }, [toast]);

  const copy = useCallback(async (text: string, count: number) => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopied((c) => c + count); sfx("copy"); toast(count === 1 ? tRef.current("toast.copied1") : tRef.current("toast.copiedN", { n: fmtRef.current(count) })); }
    else toast(tRef.current("toast.copyFail"), "error");
    return ok;
  }, [sfx, toast]);

  const toggle = useCallback((n: number) => setSelected((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; }), []);
  const selectMany = useCallback((ns: number[]) => setSelected(new Set(ns)), []);
  const deselectAll = useCallback(() => setSelected(new Set()), []);
  const clearResults = useCallback(() => { setRows([]); setSelected(new Set()); setOriginal(""); setBase(""); setTotal(0); setCopied(0); toast(tRef.current("toast.cleared"), "info"); }, [toast]);

  const exportRows = useCallback((kind: "txt" | "csv", numbered: boolean) => {
    const sel = selRef.current;
    const list = sel.size > 0 ? rowsRef.current.filter((r) => sel.has(r.n)) : rowsRef.current;
    if (!list.length) { toast(tRef.current("toast.noExport"), "warning"); return; }
    if (kind === "txt") download("gmail-variations.txt", toTxt(list, numbered), "text/plain");
    else download("gmail-variations.csv", toCsv(list, numbered), "text/csv");
    toast(tRef.current("toast.exported", { n: fmtRef.current(list.length), kind: kind.toUpperCase() }));
  }, [toast]);

  const exportAll = useCallback(async (kind: "txt" | "csv", numbered: boolean) => {
    const b = baseRef.current;
    if (!b) { toast(tRef.current("toast.noExport"), "warning"); return; }
    const count = Math.min(totalRef.current, EXPORT_MAX);
    setExporting(true); toast(tRef.current("toast.exporting"), "info");
    try {
      const parts = await buildParts(b, count, numbered, kind);
      download(`gmail-variations-all.${kind}`, parts, kind === "txt" ? "text/plain" : "text/csv");
      if (count < totalRef.current) toast(tRef.current("toast.exportCapped", { n: fmtRef.current(count) }), "warning");
      else toast(tRef.current("toast.exported", { n: fmtRef.current(count), kind: kind.toUpperCase() }));
    } finally { setExporting(false); }
  }, [toast]);

  const persist = (h: HistoryItem[]) => { setHistory(h); save("jannz.history", h); };
  const saveHistory = useCallback(() => {
    if (!rowsRef.current.length) return;
    persist([{ id: String(Date.now()), original, total, limit: rowsRef.current.length, date: new Date().toISOString() }, ...history].slice(0, 50));
    toast(tRef.current("toast.saved"));
  }, [original, total, history, toast]);
  const deleteHistory = useCallback((id: string) => persist(history.filter((h) => h.id !== id)), [history]);
  const clearHistory = useCallback(() => { setHistory([]); remove("jannz.history"); toast(tRef.current("toast.histCleared"), "info"); }, [toast]);
  const openHistory = useCallback((h: HistoryItem) => { setInput(h.original); run(h.original, Math.min(h.limit, 5000)); }, [run]);

  return useMemo(() => ({
    settings, updateSettings, resetSettings, t, fmt, page, go, input, setInput, error, setError, original, total, limit, setLimit, rows, loading, exporting,
    selected, copied, history, toastMsg, toast, sfx, run, loadMore, copy, toggle, selectMany, deselectAll, clearResults, exportRows, exportAll, saveHistory, deleteHistory, clearHistory, openHistory,
  }), [settings, updateSettings, resetSettings, t, fmt, page, go, input, error, original, total, limit, rows, loading, exporting, selected, copied, history, toastMsg, toast, sfx, run, loadMore, copy, toggle, selectMany, deselectAll, clearResults, exportRows, exportAll, saveHistory, deleteHistory, clearHistory, openHistory]);
}

type Store = ReturnType<typeof useStore>;
const Ctx = createContext<Store | null>(null);
export function AppProvider({ children }: { children: ReactNode }) { return <Ctx.Provider value={useStore()}>{children}</Ctx.Provider>; }
export function useApp() { const c = useContext(Ctx); if (!c) throw new Error("useApp di luar AppProvider"); return c; }
