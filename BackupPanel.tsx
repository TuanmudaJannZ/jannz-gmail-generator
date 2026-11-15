import { useRef, useState } from "react";
import { Download, Settings as Cog, Upload } from "lucide-react";
import { useApp } from "./AppContext";
import type { Parsed } from "./backup";
import { Button } from "./Button";
import { Modal } from "./Modal";

/** Backup/restore + ekspor konfigurasi. Restore memvalidasi file, meminta konfirmasi, dan menggabungkan (tidak menghapus) data yang ada. */
export function BackupPanel() {
  const { t, fmt, downloadBackup, readBackup, applyBackup } = useApp();
  const file = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Extract<Parsed, { ok: true }> | null>(null);
  return (
    <div className="space-y-3">
      <div><p className="font-medium text-sm">{t("set.data")}</p><p className="muted text-xs">{t("set.dataHint")}</p></div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => downloadBackup("full")}><Download size={16} />{t("set.backup")}</Button>
        <Button onClick={() => downloadBackup("config")}><Cog size={16} />{t("set.backupCfg")}</Button>
        <Button onClick={() => file.current?.click()}><Upload size={16} />{t("set.restore")}</Button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; const p = await readBackup(f); if (p) setPending(p); }} />
      </div>
      <Modal open={!!pending} onClose={() => setPending(null)} role="alertdialog" label={t("set.restoreTitle")} className="p-6 max-w-sm w-full">
        <h2 className="text-lg">{t("set.restoreTitle")}</h2>
        <p className="muted text-sm mt-2">{pending && t("set.restoreBody", { n: fmt(pending.history.length), f: fmt(pending.favorites.length), drop: pending.dropped ? t("set.restoreDrop", { n: fmt(pending.dropped) }) : "" })}</p>
        <div className="flex gap-2 justify-end mt-5">
          <Button onClick={() => setPending(null)}>{t("set.cancel")}</Button>
          <Button variant="primary" onClick={() => { if (pending) applyBackup(pending); setPending(null); }}>{t("set.restoreGo")}</Button>
        </div>
      </Modal>
    </div>
  );
}
