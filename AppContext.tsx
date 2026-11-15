import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { EXPORT_MAX, generate, MAX_LOADED, parseGmail, ParseErr, Row, totalVariations } from "./gmail";
import { BIG_EXPORT_BYTES, buildBlob, copyToClipboard, download, estimateBytes, type ExportKind, type ExportSource, listBytes, MIME, serializeFavorites, serializeHistory, serializeRows } from "./export";
import { type HistoryItem, KEYS, loadValidated, remove, sanitizeHistory, save, statsEmpty, clearRecovery } from "./storage";
import { buildBackup, buildConfigBackup, mergeFavorites, mergeHistory, parseBackup } from "./backup";
import { useLibrary } from "./useLibrary";
import { play, Sfx } from "./sound";
import { Settings, useSettings } from "./useSettings";
import { locale, makeT } from "./i18n";

export type ToastType = "success" | "error" | "warning" | "info";
export type Page = "home" | "generator" | "hub" | "history" | "settings";
export type { HistoryItem, ExportKind, ExportSource };
type ExportAsk = { source: ExportSource; kind: ExportKind; numbered: boolean; count: number; bytes: number };

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
  const [exportProgress, setExportProgress] = useState(0);
  const [exportAsk, setExportAsk] = useState<ExportAsk | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadValidated<HistoryItem[]>(KEYS.history, [], sanitizeHistory));
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

  const onStoreFail = useCallback(() => toast(tRef.current("toast.storageFail"), "error"), [toast]);
  const lib = useLibrary(onStoreFail);
  const { track, addFavorites, toggleFavorite, replaceFavorites, replaceStats, clearFavorites, resetStats } = lib;

  const run = useCallback((raw: string, lim: number) => {
    const p = parseGmail(raw);
    if (!p.ok) { setError(p.err); return false; }
    setError(null); setLoading(true); setPage("generator"); setOriginal(p.original); setBase(p.base);
    window.setTimeout(() => {
      const first = generate(p.base, lim); setTotal(totalVariations(p.base)); setRows(first); setSelected(new Set()); setLoading(false); sfx("done"); track("generate", first.length);
    }, 380);
    return true;
  }, [sfx, track]);

  const loadMore = useCallback(() => {
    const cur = rowsRef.current.length;
    const room = Math.min(MAX_LOADED - cur, totalRef.current - cur, limitRef.current);
    if (room <= 0 || !baseRef.current) return;
    const more = generate(baseRef.current, room, cur);
    setRows((r) => r.concat(more)); track("generate", more.length);
    toast(tRef.current("toast.loaded", { n: fmtRef.current(more.length) }), "info");
  }, [toast, track]);

  const copy = useCallback(async (text: string, count: number) => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopied((c) => c + count); track("copy", count); sfx("copy"); toast(count === 1 ? tRef.current("toast.copied1") : tRef.current("toast.copiedN", { n: fmtRef.current(count) })); }
    else toast(tRef.current("toast.copyFail"), "error");
    return ok;
  }, [sfx, toast, track]);

  const toggle = useCallback((n: number) => setSelected((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; }), []);
  const selectMany = useCallback((ns: number[]) => setSelected(new Set(ns)), []);
  const deselectAll = useCallback(() => setSelected(new Set()), []);
  const clearResults = useCallback(() => { setRows([]); setSelected(new Set()); setOriginal(""); setBase(""); setTotal(0); setCopied(0); toast(tRef.current("toast.cleared"), "info"); }, [toast]);

  const exportRows = useCallback((kind: ExportKind, numbered: boolean) => {
    const sel = selRef.current;
    const list = sel.size > 0 ? rowsRef.current.filter((r) => sel.has(r.n)) : rowsRef.current;
    if (!list.length) { toast(tRef.current("toast.noExport"), "warning"); return; }
    download(`gmail-variations.${kind}`, serializeRows(list, numbered, kind), MIME[kind]);
    track("export", list.length, sel.size > 0 ? "selected" : "loaded");
    toast(tRef.current("toast.exported", { n: fmtRef.current(list.length), kind: kind.toUpperCase() }));
  }, [toast, track]);

  const favRef = useRef(lib.favorites); favRef.current = lib.favorites;
  const statsRef2 = useRef(lib.stats); statsRef2.current = lib.stats;
  const histRef = useRef(history); histRef.current = history;
  /** Ukuran dan jumlah baris untuk sumber ekspor (dipakai UI dan konfirmasi file besar). */
  const planExport = useCallback((source: ExportSource, kind: ExportKind, numbered: boolean) => {
    if (source === "all") { const c = baseRef.current ? Math.min(totalRef.current, EXPORT_MAX) : 0; return { count: c, bytes: c ? estimateBytes(baseRef.current, c, numbered, kind) : 0 }; }
    if (source === "favorites") return { count: favRef.current.length, bytes: listBytes(favRef.current, false, kind, kind === "txt" ? 0 : 40) };
    if (source === "history") return { count: histRef.current.length, bytes: listBytes(histRef.current.map((h) => ({ email: h.original })), false, kind, kind === "txt" ? 0 : 60) };
    const sel = selRef.current, list = source === "selected" ? rowsRef.current.filter((r) => sel.has(r.n)) : rowsRef.current;
    return { count: list.length, bytes: listBytes(list, numbered, kind) };
  }, []);

  const exportCenter = useCallback(async (source: ExportSource, kind: ExportKind, numbered: boolean, confirmed = false) => {
    if (abortRef.current) return;
    const plan = planExport(source, kind, numbered);
    if (!plan.count) { toast(tRef.current("toast.noExport"), "warning"); return; }
    if (!confirmed && plan.bytes > BIG_EXPORT_BYTES) { setExportAsk({ source, kind, numbered, count: plan.count, bytes: plan.bytes }); return; }
    const name = `gmail-variations-${source}.${kind}`;
    if (source !== "all") {
      const sel = selRef.current;
      const text = source === "favorites" ? serializeFavorites(favRef.current, kind) : source === "history" ? serializeHistory(histRef.current, kind)
        : serializeRows(source === "selected" ? rowsRef.current.filter((r) => sel.has(r.n)) : rowsRef.current, numbered, kind);
      download(name, text, MIME[kind]); track("export", plan.count, source);
      toast(tRef.current("toast.exported", { n: fmtRef.current(plan.count), kind: kind.toUpperCase() })); return;
    }
    const ac = new AbortController(); abortRef.current = ac;
    setExporting(true); setExportProgress(0); toast(tRef.current("toast.exporting"), "info");
    try {
      const blob = await buildBlob(baseRef.current, plan.count, numbered, kind, setExportProgress, ac.signal);
      download(name, blob, MIME[kind]); track("export", plan.count, source);
      if (plan.count < totalRef.current) toast(tRef.current("toast.exportCapped", { n: fmtRef.current(plan.count) }), "warning");
      else toast(tRef.current("toast.exported", { n: fmtRef.current(plan.count), kind: kind.toUpperCase() }));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") toast(tRef.current("toast.exportCancelled"), "info");
      else toast(tRef.current("toast.exportFail"), "error");
    } finally { abortRef.current = null; setExporting(false); setExportProgress(0); }
  }, [toast, track, planExport]);
  const exportAll = useCallback((kind: ExportKind, numbered: boolean, confirmed = false) => exportCenter("all", kind, numbered, confirmed), [exportCenter]);
  const cancelExport = useCallback(() => abortRef.current?.abort(), []);
  const dismissExport = useCallback(() => setExportAsk(null), []);
  const confirmExport = useCallback(() => { const a = exportAsk; setExportAsk(null); if (a) void exportCenter(a.source, a.kind, a.numbered, true); }, [exportAsk, exportCenter]);

  const persist = (h: HistoryItem[]) => { setHistory(h); if (!save(KEYS.history, h)) toast(tRef.current("toast.storageFail"), "error"); };
  const saveHistory = useCallback(() => {
    if (!rowsRef.current.length) return;
    const item: HistoryItem = { id: String(Date.now()), original, total, limit: rowsRef.current.length, date: new Date().toISOString() };
    const dup = history.some((h) => h.original === original); // deteksi duplikat: alamat yang sama diperbarui, tidak digandakan
    persist([item, ...history.filter((h) => h.original !== original)].slice(0, 50));
    track("save", 1, original);
    toast(tRef.current(dup ? "toast.savedUpdated" : "toast.saved"));
  }, [original, total, history, toast, track]);
  const deleteHistory = useCallback((id: string) => persist(history.filter((h) => h.id !== id)), [history]);
  const clearHistory = useCallback(() => { setHistory([]); remove(KEYS.history); toast(tRef.current("toast.histCleared"), "info"); }, [toast]);
  const openHistory = useCallback((h: HistoryItem) => { setInput(h.original); run(h.original, Math.min(h.limit, 5000)); }, [run]);

  const historyRef = useRef(history); historyRef.current = history;
  const addFav = useCallback((emails: string[]) => {
    const { added, dup } = addFavorites(emails);
    if (added) track("favorite", added);
    toast(tRef.current(dup && added ? "fav.addedDup" : dup ? "fav.allDup" : "fav.added", { n: fmtRef.current(added), d: fmtRef.current(dup) }), added ? "success" : "info");
  }, [addFavorites, toast, track]);
  const toggleFav = useCallback((email: string) => { if (toggleFavorite(email)) track("favorite", 1); }, [toggleFavorite, track]);

  const downloadBackup = useCallback((kind: "full" | "config" = "full") => {
    const b = kind === "config" ? buildConfigBackup(sRef.current) : buildBackup(sRef.current, historyRef.current, favRef.current, statsRef2.current);
    download(`jannz-${kind === "config" ? "config" : "backup"}-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(b, null, 2), "application/json");
    toast(tRef.current("toast.backupDone"));
  }, [toast]);
  /** Baca file cadangan dan validasi; belum menerapkan apa pun (diterapkan lewat applyBackup setelah konfirmasi). */
  const readBackup = useCallback(async (file: File) => {
    let text = ""; try { text = await file.text(); } catch { toast(tRef.current("toast.restoreFail"), "error"); return null; }
    const p = parseBackup(text);
    if (!p.ok) { toast(tRef.current(p.reason === "version" ? "toast.restoreNewer" : "toast.restoreFail"), "error"); return null; }
    return p;
  }, [toast]);
  const applyBackup = useCallback((p: Extract<ReturnType<typeof parseBackup>, { ok: true }>) => {
    if (p.settings) updateSettings(p.settings);
    if (p.history.length) persist(mergeHistory(historyRef.current, p.history));
    if (p.favorites.length) replaceFavorites(mergeFavorites(favRef.current, p.favorites));
    if (p.stats && statsEmpty(statsRef2.current)) replaceStats(p.stats); // statistik hanya diadopsi bila statistik di perangkat ini masih kosong
    toast(tRef.current("toast.restoreDone", { n: fmtRef.current(p.history.length + p.favorites.length) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, updateSettings, replaceFavorites, replaceStats]);
  /** Reset data pengguna (riwayat, favorit, statistik, data pulihan). Pengaturan tidak disentuh. Pemanggil wajib meminta konfirmasi. */
  const resetData = useCallback(() => {
    setHistory([]); remove(KEYS.history); clearFavorites(); resetStats(); clearRecovery();
    toast(tRef.current("toast.dataReset"), "info");
  }, [clearFavorites, resetStats, toast]);

  return useMemo(() => ({
    settings, updateSettings, resetSettings, t, fmt, page, go, input, setInput, error, setError, original, total, limit, setLimit, rows, loading, exporting, exportProgress, exportAsk, cancelExport, dismissExport, confirmExport,
    selected, copied, history, toastMsg, toast, sfx, run, loadMore, copy, toggle, selectMany, deselectAll, clearResults, exportRows, exportAll, saveHistory, deleteHistory, clearHistory, openHistory, downloadBackup, readBackup, applyBackup,
    favorites: lib.favorites, stats: lib.stats, addFav, toggleFav, removeFavorites: lib.removeFavorites, setFavGroup: lib.setGroup, clearFavorites: lib.clearFavorites, resetStats: lib.resetStats, resetData, exportCenter, planExport,
  }), [settings, updateSettings, resetSettings, t, fmt, page, go, input, error, original, total, limit, rows, loading, exporting, exportProgress, exportAsk, cancelExport, dismissExport, confirmExport, selected, copied, history, toastMsg, toast, sfx, run, loadMore, copy, toggle, selectMany, deselectAll, clearResults, exportRows, exportAll, saveHistory, deleteHistory, clearHistory, openHistory, downloadBackup, readBackup, applyBackup, lib.favorites, lib.stats, addFav, toggleFav, lib.removeFavorites, lib.setGroup, lib.clearFavorites, lib.resetStats, resetData, exportCenter, planExport]);
}

type Store = ReturnType<typeof useStore>;
const Ctx = createContext<Store | null>(null);
export function AppProvider({ children }: { children: ReactNode }) { return <Ctx.Provider value={useStore()}>{children}</Ctx.Provider>; }
export function useApp() { const c = useContext(Ctx); if (!c) throw new Error("useApp di luar AppProvider"); return c; }
