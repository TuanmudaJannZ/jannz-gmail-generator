import { ReactNode } from "react";
import { Moon, RotateCcw, Sun, Trash2 } from "lucide-react";
import { useApp } from "./AppContext";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";
import { Toggle } from "./Toggle";

const accents = ["#6C8CFF", "#A78BFA", "#67E8F9", "#6EE7B7"];
const Row = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--edge)] last:border-0">
    <div><p className="font-medium text-sm">{label}</p>{hint && <p className="muted text-xs">{hint}</p>}</div>{children}
  </div>
);
export function SettingsPage() {
  const { settings: s, updateSettings: u, resetSettings, clearHistory, history, toast } = useApp();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <GlassCard tilt={false} className="px-5 py-2">
        <Row label="Tema"><div className="flex gap-2">
          <Button variant={s.theme === "dark" ? "primary" : "glass"} onClick={() => u({ theme: "dark" })}><Moon size={16} />Dark</Button>
          <Button variant={s.theme === "light" ? "primary" : "glass"} onClick={() => u({ theme: "light" })}><Sun size={16} />Light</Button>
        </div></Row>
        <Row label="Animation intensity" hint="Mempengaruhi tilt, stagger, dan gerak"><div className="flex gap-1">
          {["Off", "Normal", "High"].map((l, i) => <Button key={l} variant={s.intensity === i ? "primary" : "glass"} onClick={() => u({ intensity: i })}>{l}</Button>)}
        </div></Row>
        <Row label="Reduce motion" hint="Matikan animasi gerak (juga mengikuti pengaturan sistem)"><Toggle label="Reduce motion" checked={s.reduceMotion} onChange={(v) => u({ reduceMotion: v })} /></Row>
        <Row label="Sound effects" hint="Default mati; hanya bunyi setelah interaksi"><Toggle label="Sound effects" checked={s.sound} onChange={(v) => u({ sound: v })} /></Row>
        <Row label="Particle effects"><Toggle label="Particle effects" checked={s.particles} onChange={(v) => u({ particles: v })} /></Row>
        <Row label="Cursor effects" hint="Spotlight mengikuti kursor (desktop)"><Toggle label="Cursor effects" checked={s.cursor} onChange={(v) => u({ cursor: v })} /></Row>
        <Row label={`Glass blur: ${s.blur}px`}><input type="range" min={6} max={40} value={s.blur} onChange={(e) => u({ blur: Number(e.target.value) })} aria-label="Glass blur intensity" className="range" /></Row>
        <Row label="Accent color"><div className="flex gap-2">
          {accents.map((c) => <button key={c} aria-label={`Warna ${c}`} aria-pressed={s.accent === c} onClick={() => u({ accent: c })} className={`swatch ${s.accent === c ? "on" : ""}`} style={{ background: c }} />)}
        </div></Row>
        <Row label="Compact mode"><Toggle label="Compact mode" checked={s.compact} onChange={(v) => u({ compact: v })} /></Row>
      </GlassCard>
      <div className="flex flex-wrap gap-3">
        <Button variant="danger" disabled={!history.length} onClick={clearHistory}><Trash2 size={16} />Clear history</Button>
        <Button onClick={() => { resetSettings(); toast("Pengaturan direset"); }}><RotateCcw size={16} />Reset settings</Button>
      </div>
    </div>
  );
}
