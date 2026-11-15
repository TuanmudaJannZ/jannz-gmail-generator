import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useApp } from "./AppContext";
import { BackupPanel } from "./BackupPanel";
import { Button } from "./Button";
import { download, fmtBytes } from "./export";
import { GlassCard } from "./GlassCard";
import { Modal } from "./Modal";
import { clearRecovery, hasRecovery, localUsage, recoveryDump } from "./storage";

export function DataPanel() {
  const A = useApp(), { t, fmt } = A;
  const [rev, setRev] = useState(0), [confirm, setConfirm] = useState(false), [quota, setQuota] = useState<{ usage: number; quota: number } | null>(null);
  const usage = useMemo(() => localUsage(), [A.history, A.favorites, A.stats, A.settings, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let live = true;
    navigator.storage?.estimate?.().then((e) => { if (live && e.usage != null && e.quota != null) setQuota({ usage: e.usage, quota: e.quota }); }).catch(() => {});
    return () => { live = false; };
  }, [rev]);
  const rec = useMemo(() => hasRecovery(), [rev]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-4">
      <GlassCard tilt={false} className="p-4 sm:p-5 space-y-1">
        <p className="font-medium text-sm">{t("data.usage")}</p>
        <p className="muted text-sm">{t("data.usageApp", { size: "≈ " + fmtBytes(usage.bytes), n: fmt(usage.keys) })}</p>
        <p className="muted text-xs">{quota ? t("data.usageOrigin", { used: fmtBytes(quota.usage), quota: fmtBytes(quota.quota) }) : t("data.usageUnknown")}</p>
        <p className="muted text-xs">{t("data.counts", { h: fmt(A.history.length), f: fmt(A.favorites.length) })}</p>
      </GlassCard>
      {rec && (
        <GlassCard tilt={false} className="p-4 sm:p-5 space-y-3">
          <p className="text-sm">{t("data.recovery")}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => download("jannz-recovery.json", recoveryDump(), "application/json")}>{t("data.recoveryDl")}</Button>
            <Button variant="danger" onClick={() => { clearRecovery(); setRev((x) => x + 1); }}>{t("data.recoveryClear")}</Button>
          </div>
        </GlassCard>
      )}
      <GlassCard tilt={false} className="p-4 sm:p-5"><BackupPanel /></GlassCard>
      <GlassCard tilt={false} className="p-4 sm:p-5 space-y-3">
        <div><p className="font-medium text-sm">{t("data.resetTitle")}</p><p className="muted text-xs">{t("data.resetHint")}</p></div>
        <Button variant="danger" onClick={() => setConfirm(true)}><Trash2 size={16} />{t("data.resetBtn")}</Button>
      </GlassCard>
      <Modal open={confirm} onClose={() => setConfirm(false)} role="alertdialog" label={t("data.resetConfirmTitle")} className="p-6 max-w-sm w-full">
        <h2 className="text-lg">{t("data.resetConfirmTitle")}</h2>
        <p className="muted text-sm mt-2">{t("data.resetConfirmBody", { h: fmt(A.history.length), f: fmt(A.favorites.length) })}</p>
        <div className="flex flex-col gap-2 mt-5">
          <Button onClick={() => A.downloadBackup("full")}>{t("data.backupFirst")}</Button>
          <div className="flex gap-2 justify-end"><Button onClick={() => setConfirm(false)}>{t("set.cancel")}</Button><Button variant="danger" onClick={() => { A.resetData(); setConfirm(false); setRev((x) => x + 1); }}>{t("data.resetGo")}</Button></div>
        </div>
      </Modal>
    </div>
  );
}
