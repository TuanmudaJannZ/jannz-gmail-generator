import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, Eraser, History, LayoutDashboard, Moon, Search, Settings, Sparkles } from "lucide-react";
import { useApp } from "./AppContext";
import { Modal } from "./Modal";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const A = useApp();
  const { t } = A;
  const [q, setQ] = useState(""), [idx, setIdx] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const cmds = useMemo(() => [
    { label: t("cmd.gen"), Icon: Sparkles, run: () => A.go("generator") },
    { label: t("cmd.hub"), Icon: LayoutDashboard, run: () => A.go("hub") },
    { label: t("cmd.hist"), Icon: History, run: () => A.go("history") },
    { label: t("cmd.settings"), Icon: Settings, run: () => A.go("settings") },
    { label: t("cmd.theme"), Icon: Moon, run: () => A.updateSettings({ theme: A.settings.theme === "dark" ? "light" : "dark" }) },
    { label: t("cmd.clear"), Icon: Eraser, run: () => A.clearResults() },
    { label: t("cmd.exportTxt"), Icon: Download, run: () => A.exportRows("txt", true) },
    { label: t("cmd.exportCsv"), Icon: Download, run: () => A.exportRows("csv", true) },
    { label: t("cmd.exportJson"), Icon: Download, run: () => A.exportRows("json", true) },
  ], [A, t]);
  const list = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => { if (open) { setQ(""); setIdx(0); } }, [open]);
  useEffect(() => setIdx(0), [q]);
  useEffect(() => { (listRef.current?.children[idx] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" }); }, [idx]);
  const exec = (i: number) => { const c = list[i]; if (c) { onClose(); c.run(); } };
  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, list.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") exec(idx); // Escape ditangani Modal
  };
  return (
    <Modal open={open} onClose={onClose} label={t("home.palette")} placement="top" className="cmd">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--edge)]">
        <Search size={18} className="muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={key} placeholder={t("cmd.placeholder")} className="bare-input" aria-label={t("cmd.search")} />
        <kbd className="kbd">Esc</kbd>
      </div>
      <ul ref={listRef} className="p-2 max-h-72 overflow-auto" role="listbox">
        {list.map((c, i) => (
          <li key={c.label} role="option" aria-selected={i === idx}>
            <button className={`cmd-item ${i === idx ? "sel" : ""}`} onMouseEnter={() => setIdx(i)} onClick={() => exec(i)}><c.Icon size={17} />{c.label}</button>
          </li>
        ))}
        {!list.length && <li className="muted p-4 text-sm">{t("cmd.none")}</li>}
      </ul>
    </Modal>
  );
}
