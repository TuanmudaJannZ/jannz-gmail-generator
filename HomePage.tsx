import { Command, Download, Eraser, Sparkles } from "lucide-react";
import { useApp } from "./AppContext";
import { EmailInput } from "./EmailInput";
import { Stats } from "./Stats";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { Disclaimer } from "./Disclaimer";

export function HomePage({ openPalette }: { openPalette: () => void }) {
  const A = useApp();
  const { t, fmt } = A;
  return (
    <div className="space-y-6">
      <header className="text-center pt-2 pb-2">
        <p className="muted text-xs uppercase tracking-[0.25em] mb-3">Generate. Organize. Simplify.</p>
        <h1 className="hero-title">{t("hero.title")}</h1>
        <p className="text-lg mt-3">{t("hero.sub")}</p>
        <p className="muted mt-1 max-w-xl mx-auto">{t("hero.desc")}</p>
      </header>
      <EmailInput />
      <Stats />
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h2 className="mb-3">{t("home.recent")}</h2>
          {A.history.length ? (
            <ul className="space-y-2">
              {A.history.slice(0, 4).map((h) => (
                <li key={h.id}><button className="row glass-lite w-full text-left" onClick={() => A.openHistory(h)}>
                  <span className="mono text-sm truncate flex-1">{h.original}</span><span className="muted text-xs">{t("variations", { n: fmt(h.total) })}</span>
                </button></li>
              ))}
            </ul>
          ) : <p className="muted text-sm">{t("home.recentEmpty")}</p>}
        </GlassCard>
        <GlassCard className="p-5">
          <h2 className="mb-3">{t("home.quick")}</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => A.go("generator")}><Sparkles size={16} />{t("home.openGen")}</Button>
            <Button onClick={() => A.exportRows("txt", true)}><Download size={16} />{t("home.exportTxt")}</Button>
            <Button onClick={A.clearResults}><Eraser size={16} />{t("home.clear")}</Button>
            <Button onClick={openPalette}><Command size={16} />{t("home.palette")}</Button>
          </div>
        </GlassCard>
      </div>
      <Disclaimer />
    </div>
  );
}
