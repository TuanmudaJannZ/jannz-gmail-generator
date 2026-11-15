import { ReactNode } from "react";
import { Moon, RotateCcw, Sun, Trash2 } from "lucide-react";
import { useApp } from "./AppContext";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";
import { Toggle } from "./Toggle";
import { BackupPanel } from "./BackupPanel";

const accents = ["#6C8CFF", "#A78BFA", "#67E8F9", "#6EE7B7"];
const Row = ({ label, hint, stack, children }: { label: string; hint?: string; stack?: boolean; children: ReactNode }) => (
  <div className={`set-row ${stack ? "stack" : ""}`}>
    <div className="min-w-0"><p className="font-medium text-sm">{label}</p>{hint && <p className="muted text-xs">{hint}</p>}</div>{children}
  </div>
);
export function SettingsPage() {
  const { settings: s, updateSettings: u, resetSettings, clearHistory, history, toast, t } = useApp();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl">{t("set.title")}</h1>
      <GlassCard tilt={false} className="p-4"><p className="muted text-xs uppercase tracking-wider mb-3">{t("set.preview")}</p><div className="preview"><Button variant="primary">{t("set.previewPrimary")}</Button><Button>{t("set.previewGlass")}</Button><span className="chip">{t("res.badge")}</span><span className="muted text-sm">{t("set.previewText")}</span></div></GlassCard>
      <GlassCard tilt={false} className="px-5 py-2">
        <Row label={t("set.lang")} stack><div className="seg">
          <Button variant={s.lang === "id" ? "primary" : "glass"} onClick={() => u({ lang: "id" })}>Indonesia</Button>
          <Button variant={s.lang === "en" ? "primary" : "glass"} onClick={() => u({ lang: "en" })}>English</Button>
        </div></Row>
        <Row label={t("set.theme")} stack><div className="seg">
          <Button variant={s.theme === "dark" ? "primary" : "glass"} onClick={() => u({ theme: "dark" })}><Moon size={16} />{t("set.dark")}</Button>
          <Button variant={s.theme === "light" ? "primary" : "glass"} onClick={() => u({ theme: "light" })}><Sun size={16} />{t("set.light")}</Button>
        </div></Row>
        <Row label={t("set.font")} hint={t("set.fontHint")} stack><div className="seg">
          {([["fluid", "Fluid"], ["techno", "Techno"], ["classic", "Classic"]] as const).map(([k, l]) => <Button key={k} variant={s.font === k ? "primary" : "glass"} onClick={() => u({ font: k })}>{l}</Button>)}
        </div></Row>
        <Row label={t("set.anim")} hint={t("set.animHint")} stack><div className="seg">
          {([t("set.off"), t("set.normal"), t("set.high")]).map((l, i) => <Button key={i} variant={s.intensity === i ? "primary" : "glass"} onClick={() => u({ intensity: i })}>{l}</Button>)}
        </div></Row>
        <Row label={t("set.reduce")} hint={t("set.reduceHint")}><Toggle label={t("set.reduce")} checked={s.reduceMotion} onChange={(v) => u({ reduceMotion: v })} /></Row>
        <Row label={t("set.sound")} hint={t("set.soundHint")}><Toggle label={t("set.sound")} checked={s.sound} onChange={(v) => u({ sound: v })} /></Row>
        <Row label={t("set.particles")}><Toggle label={t("set.particles")} checked={s.particles} onChange={(v) => u({ particles: v })} /></Row>
        <Row label={t("set.cursor")} hint={t("set.cursorHint")}><Toggle label={t("set.cursor")} checked={s.cursor} onChange={(v) => u({ cursor: v })} /></Row>
        <Row label={t("set.blur", { n: s.blur })}><input type="range" min={6} max={40} value={s.blur} onChange={(e) => u({ blur: Number(e.target.value) })} aria-label={t("set.blurAria")} className="range" /></Row>
        <Row label={t("set.accent")}><div className="flex gap-2">
          {accents.map((c) => <button key={c} aria-label={t("set.color", { c })} aria-pressed={s.accent === c} onClick={() => u({ accent: c })} className={`swatch ${s.accent === c ? "on" : ""}`} style={{ background: c }} />)}
        </div></Row>
        <Row label={t("set.compact")}><Toggle label={t("set.compact")} checked={s.compact} onChange={(v) => u({ compact: v })} /></Row>
      </GlassCard>
      <GlassCard tilt={false} className="p-5"><BackupPanel /></GlassCard>
      <div className="flex flex-wrap gap-3">
        <Button variant="danger" disabled={!history.length} onClick={clearHistory}><Trash2 size={16} />{t("set.clearHistory")}</Button>
        <Button onClick={() => { resetSettings(); toast(t("toast.reset"), "info"); }}><RotateCcw size={16} />{t("set.reset")}</Button>
      </div>
    </div>
  );
}
