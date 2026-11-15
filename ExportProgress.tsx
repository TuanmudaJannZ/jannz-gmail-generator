import { useApp } from "./AppContext";
import { Button } from "./Button";

export function ExportProgress() {
  const A = useApp(), p = Math.round(A.exportProgress * 100), label = A.t("res.exportProg", { p });
  if (!A.exporting) return null;
  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="progress flex-1" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p} aria-label={label}><i style={{ transform: `scaleX(${A.exportProgress})` }} /></div>
      <span className="muted text-xs w-28 text-right">{label}</span>
      <Button variant="danger" onClick={A.cancelExport}>{A.t("res.exportCancel")}</Button>
    </div>
  );
}
