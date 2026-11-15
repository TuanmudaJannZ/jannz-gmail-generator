import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useApp, type ExportKind, type ExportSource } from "./AppContext";
import { BIG_EXPORT_BYTES, fmtBytes } from "./export";
import { Button } from "./Button";
import { ExportProgress } from "./ExportProgress";
import { GlassCard } from "./GlassCard";
import { EXPORT_MAX } from "./gmail";

const KINDS: ExportKind[] = ["txt", "csv", "json"];
export function ExportCenter() {
  const A = useApp(), { t, fmt } = A;
  const [source, setSource] = useState<ExportSource>("loaded"), [kind, setKind] = useState<ExportKind>("txt"), [numbered, setNumbered] = useState(true);
  const plan = useMemo(() => A.planExport(source, kind, numbered), [A.planExport, A.rows, A.selected, A.favorites, A.history, A.total, A.original, source, kind, numbered]); // eslint-disable-line react-hooks/exhaustive-deps
  const canNumber = source !== "favorites" && source !== "history";
  const total = Math.min(A.total, EXPORT_MAX);
  const opts: [ExportSource, string][] = [
    ["selected", t("exp.src.selected", { n: fmt(A.selected.size) })], ["loaded", t("exp.src.loaded", { n: fmt(A.rows.length) })], ["all", t("exp.src.all", { n: fmt(total) })],
    ["favorites", t("exp.src.fav", { n: fmt(A.favorites.length) })], ["history", t("exp.src.hist", { n: fmt(A.history.length) })],
  ];
  return (
    <GlassCard tilt={false} className="p-4 sm:p-5 space-y-4">
      <div>
        <label className="font-medium text-sm block mb-2" htmlFor="exp-src">{t("exp.source")}</label>
        <select id="exp-src" className="select w-full" value={source} onChange={(e) => setSource(e.target.value as ExportSource)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </div>
      <div>
        <p className="font-medium text-sm mb-2" id="exp-fmt">{t("exp.format")}</p>
        <div className="seg" role="radiogroup" aria-labelledby="exp-fmt">{KINDS.map((k) => <Button key={k} role="radio" aria-checked={kind === k} variant={kind === k ? "primary" : "glass"} onClick={() => setKind(k)}>{k.toUpperCase()}</Button>)}</div>
      </div>
      <label className={`flex items-center gap-2 text-sm ${canNumber ? "cursor-pointer" : "opacity-50"}`}><input type="checkbox" className="check" disabled={!canNumber} checked={canNumber && numbered} onChange={(e) => setNumbered(e.target.checked)} />{t("res.numbered")}{!canNumber && <span className="muted text-xs">· {t("exp.numberedNA")}</span>}</label>
      <div className="export-all !mt-0">
        {plan.count ? (
          <>
            <p className="text-sm font-medium">{t("res.exportEst", { size: "≈ " + fmtBytes(plan.bytes), n: fmt(plan.count) })}</p>
            {source === "all" && A.total > EXPORT_MAX && <p className="muted text-xs mt-1">{t("res.exportAllNote", { max: fmt(EXPORT_MAX) })}</p>}
            {plan.bytes > BIG_EXPORT_BYTES && <p className="text-xs mt-1" style={{ color: "#fbbf24" }} role="note">{t("exp.warnBig")}</p>}
          </>
        ) : <p className="muted text-sm">{t(source === "favorites" || source === "history" ? "exp.emptyData" : "exp.needGen")}</p>}
      </div>
      <Button variant="primary" disabled={!plan.count || A.exporting} onClick={() => A.exportCenter(source, kind, canNumber && numbered)}><Download size={16} />{t("exp.go", { kind: kind.toUpperCase() })}</Button>
      <ExportProgress />
    </GlassCard>
  );
}
