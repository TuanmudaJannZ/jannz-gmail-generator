import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { generate, parseGmail, Row, totalVariations } from "./gmail";
import { copyToClipboard, download, toCsv, toTxt } from "./export";
import { load, remove, save } from "./storage";
import { play, Sfx } from "./sound";
import { Settings, useSettings } from "./useSettings";

export type Page = "home" | "generator" | "history" | "settings";
export type HistoryItem = { id: string; original: string; total: number; limit: number; date: string };

function useStore() {
  const [settings, updateSettings, resetSettings] = useSettings();
  const [page, setPage] = useState<Page>("home");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [original, setOriginal] = useState("");
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(500);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>(() => load<HistoryItem[]>("jannz.history", []));
  const [toastMsg, setToastMsg] = useState<{ id: number; text: string } | null>(null);
  const sRef = useRef<Settings>(settings); sRef.current = settings;
  const rowsRef = useRef<Row[]>([]); rowsRef.current = rows;
  const selRef = useRef<Set<number>>(selected); selRef.current = selected;
  const tRef = useRef<number>();

  const toast = useCallback((text: string) => {
    setToastMsg({ id: Date.now(), text });
    window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setToastMsg(null), 2200);
  }, []);
  const sfx = useCallback((k: Sfx) => { if (sRef.current.sound) play(k); }, []);
  const go = useCallback((p: Page) => { sfx("nav"); setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, [sfx]);

  const run = useCallback((raw: string, lim: number) => {
    const p = parseGmail(raw);
    if (!p.ok) { setError(p.error); return false; }
    setError(""); setLoading(true); setPage("generator"); setOriginal(p.original);
    window.setTimeout(() => { // beri waktu skeleton tampil; hasil dibatasi `lim`
      setTotal(totalVariations(p.base)); setRows(generate(p.base, lim)); setSelected(new Set()); setLoading(false); sfx("done");
    }, 380);
    return true;
  }, [sfx]);

  const copy = useCallback(async (text: string, count: number) => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopied((c) => c + count); sfx("copy"); toast(count === 1 ? "Email disalin" : `${count} email disalin`); } else toast("Gagal menyalin");
    return ok;
  }, [sfx, toast]);

  const toggle = useCallback((n: number) => setSelected((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; }), []);
  const selectMany = useCallback((ns: number[]) => setSelected(new Set(ns)), []);
  const deselectAll = useCallback(() => setSelected(new Set()), []);
  const clearResults = useCallback(() => { setRows([]); setSelected(new Set()); setOriginal(""); setTotal(0); setCopied(0); toast("Hasil dibersihkan"); }, [toast]);

  const exportRows = useCallback((kind: "txt" | "csv", numbered: boolean) => {
    const sel = selRef.current;
    const list = sel.size > 0 ? rowsRef.current.filter((r) => sel.has(r.n)) : rowsRef.current;
    if (!list.length) { toast("Tidak ada hasil untuk diekspor"); return; }
    if (kind === "txt") download("gmail-variations.txt", toTxt(list, numbered), "text/plain");
    else download("gmail-variations.csv", toCsv(list, numbered), "text/csv");
    toast(`${list.length} email diekspor (${kind.toUpperCase()})`);
  }, [toast]);

  const persist = (h: HistoryItem[]) => { setHistory(h); save("jannz.history", h); };
  const saveHistory = useCallback(() => {
    if (!rowsRef.current.length) return;
    persist([{ id: String(Date.now()), original, total, limit: rowsRef.current.length, date: new Date().toISOString() }, ...history].slice(0, 50));
    toast("Disimpan ke riwayat (hanya di perangkat ini)");
  }, [original, total, history, toast]);
  const deleteHistory = useCallback((id: string) => persist(history.filter((h) => h.id !== id)), [history]);
  const clearHistory = useCallback(() => { setHistory([]); remove("jannz.history"); toast("Riwayat dihapus"); }, [toast]);
  const openHistory = useCallback((h: HistoryItem) => { setInput(h.original); setLimit(Math.max(100, h.limit)); run(h.original, h.limit); }, [run]);

  return useMemo(() => ({
    settings, updateSettings, resetSettings, page, go, input, setInput, error, setError, original, total, limit, setLimit, rows, loading,
    selected, copied, history, toastMsg, toast, sfx, run, copy, toggle, selectMany, deselectAll, clearResults, exportRows, saveHistory, deleteHistory, clearHistory, openHistory,
  }), [settings, updateSettings, resetSettings, page, go, input, error, original, total, limit, rows, loading, selected, copied, history, toastMsg, toast, sfx, run, copy, toggle, selectMany, deselectAll, clearResults, exportRows, saveHistory, deleteHistory, clearHistory, openHistory]);
}

type Store = ReturnType<typeof useStore>;
const Ctx = createContext<Store | null>(null);
export function AppProvider({ children }: { children: ReactNode }) { return <Ctx.Provider value={useStore()}>{children}</Ctx.Provider>; }
export function useApp() { const c = useContext(Ctx); if (!c) throw new Error("useApp di luar AppProvider"); return c; }
