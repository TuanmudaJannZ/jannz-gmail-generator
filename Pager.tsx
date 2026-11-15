import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "./AppContext";
import { Button } from "./Button";

/** Paginasi bersama (Hasil, Favorit): sebelumnya/berikutnya + lompat ke halaman. */
export function Pager({ cur, pages, onPage, label }: { cur: number; pages: number; onPage: (p: number) => void; label: string }) {
  const { t } = useApp();
  const [j, setJ] = useState("");
  const go = () => { const n = Math.floor(Number(j)); if (Number.isFinite(n) && n >= 1) onPage(Math.min(pages, n)); setJ(""); };
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Button disabled={cur <= 1} onClick={() => onPage(cur - 1)} aria-label={t("res.prev")}><ChevronLeft size={16} /></Button>
        <span className="muted text-sm text-center">{label}</span>
        <Button disabled={cur >= pages} onClick={() => onPage(cur + 1)} aria-label={t("res.next")}><ChevronRight size={16} /></Button>
      </div>
      {pages > 2 && (
        <div className="flex items-center justify-center gap-2">
          <div className="field !min-h-[44px] w-28"><input className="bare-input mono text-sm" type="number" inputMode="numeric" min={1} max={pages} value={j} placeholder={`1–${pages}`} aria-label={t("res.jump")}
            onChange={(e) => setJ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") go(); }} /></div>
          <Button onClick={go} disabled={!j}>{t("res.go")}</Button>
        </div>
      )}
    </div>
  );
}
