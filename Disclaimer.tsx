import { ShieldCheck } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useApp } from "./AppContext";
export function Disclaimer() {
  const { t } = useApp();
  return (
    <GlassCard tilt={false} className="p-4 flex gap-3 text-sm">
      <ShieldCheck className="shrink-0 text-[var(--accent)]" size={20} />
      <p className="muted"><b className="text-[var(--text)]">{t("disc.lead")}</b> {t("disc.body")}</p>
    </GlassCard>
  );
}
