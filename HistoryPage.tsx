import { useState } from "react";
import { FolderOpen, Trash2 } from "lucide-react";
import { useApp } from "./AppContext";
import { locale } from "./i18n";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";
import { Modal } from "./Modal";

export function HistoryPage() {
  const A = useApp();
  const { t, fmt } = A;
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl">{t("hist.title")}</h1>
        {A.history.length > 0 && <Button variant="danger" onClick={() => setConfirm(true)}><Trash2 size={16} />{t("hist.clearAll")}</Button>}
      </div>
      <p className="muted text-sm">{t("hist.note")}</p>
      {A.history.length === 0 && <GlassCard tilt={false} className="p-8 text-center muted">{t("hist.empty")}</GlassCard>}
      <ul className="space-y-3">
        {A.history.map((h, i) => (
          <li key={h.id}>
            <GlassCard tilt={false} lift delay={Math.min(i, 8) * 0.04} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="mono text-sm break-all">{h.original}</p>
                <p className="muted text-xs mt-1">{t("hist.meta", { date: new Date(h.date).toLocaleString(locale(A.settings.lang)), total: fmt(h.total), shown: fmt(h.limit) })}</p>
              </div>
              <Button variant="primary" onClick={() => A.openHistory(h)}><FolderOpen size={16} />{t("hist.open")}</Button>
              <Button aria-label={t("hist.delete")} onClick={() => A.deleteHistory(h.id)}><Trash2 size={16} /></Button>
            </GlassCard>
          </li>
        ))}
      </ul>
      <Modal open={confirm} onClose={() => setConfirm(false)} role="alertdialog" label={t("hist.confirmAria")} className="p-6 max-w-sm w-full">
        <h2 className="text-lg">{t("hist.confirmTitle")}</h2>
        <p className="muted text-sm mt-2">{t("hist.confirmBody")}</p>
        <div className="flex gap-2 justify-end mt-5">
          <Button onClick={() => setConfirm(false)}>{t("hist.cancel")}</Button>
          <Button variant="danger" onClick={() => { A.clearHistory(); setConfirm(false); }}>{t("hist.deleteAll")}</Button>
        </div>
      </Modal>
    </div>
  );
}
