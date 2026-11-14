import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Eraser, History, Moon, Search, Settings, Sparkles } from "lucide-react";
import { useApp } from "./AppContext";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const A = useApp();
  const [q, setQ] = useState(""), [idx, setIdx] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const cmds = useMemo(() => [
    { label: "Navigate to Generator", Icon: Sparkles, run: () => A.go("generator") },
    { label: "Navigate to History", Icon: History, run: () => A.go("history") },
    { label: "Open Settings", Icon: Settings, run: () => A.go("settings") },
    { label: "Toggle Theme", Icon: Moon, run: () => A.updateSettings({ theme: A.settings.theme === "dark" ? "light" : "dark" }) },
    { label: "Clear Results", Icon: Eraser, run: () => A.clearResults() },
    { label: "Export Results (TXT)", Icon: Download, run: () => A.exportRows("txt", true) },
    { label: "Export Results (CSV)", Icon: Download, run: () => A.exportRows("csv", true) },
  ], [A]);
  const list = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => { if (open) { setQ(""); setIdx(0); setTimeout(() => ref.current?.focus(), 30); } }, [open]);
  useEffect(() => setIdx(0), [q]);
  const exec = (i: number) => { const c = list[i]; if (c) { onClose(); c.run(); } };
  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, list.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") exec(idx);
    else if (e.key === "Escape") onClose();
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-label="Command palette" className="glass cmd" onMouseDown={(e) => e.stopPropagation()} initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--edge)]">
              <Search size={18} className="muted" />
              <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={key} placeholder="Ketik perintah…" className="bare-input" aria-label="Cari perintah" />
              <kbd className="kbd">Esc</kbd>
            </div>
            <ul className="p-2 max-h-72 overflow-auto" role="listbox">
              {list.map((c, i) => (
                <li key={c.label} role="option" aria-selected={i === idx}>
                  <button className={`cmd-item ${i === idx ? "sel" : ""}`} onMouseEnter={() => setIdx(i)} onClick={() => exec(i)}><c.Icon size={17} />{c.label}</button>
                </li>
              ))}
              {!list.length && <li className="muted p-4 text-sm">Perintah tidak ditemukan.</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
