import { Command, Download, Eraser, Sparkles } from "lucide-react";
import { useApp } from "./AppContext";
import { EmailInput } from "./EmailInput";
import { Stats } from "./Stats";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { Disclaimer } from "./Disclaimer";

export function HomePage({ openPalette }: { openPalette: () => void }) {
  const A = useApp();
  return (
    <div className="space-y-6">
      <header className="text-center pt-2 pb-2">
        <p className="muted text-xs uppercase tracking-[0.25em] mb-3">Generate. Organize. Simplify.</p>
        <h1 className="hero-title">Gmail Address Generator</h1>
        <p className="text-lg mt-3">Generate Gmail dot variations instantly.</p>
        <p className="muted mt-1 max-w-xl mx-auto">Create and organize Gmail address variations with a clean and simple interface.</p>
      </header>
      <EmailInput />
      <Stats />
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h2 className="font-semibold mb-3">Recent Activity</h2>
          {A.history.length ? (
            <ul className="space-y-2">
              {A.history.slice(0, 4).map((h) => (
                <li key={h.id}><button className="row glass-lite w-full text-left" onClick={() => A.openHistory(h)}>
                  <span className="mono text-sm truncate flex-1">{h.original}</span><span className="muted text-xs">{h.total.toLocaleString("id-ID")} variasi</span>
                </button></li>
              ))}
            </ul>
          ) : <p className="muted text-sm">Belum ada aktivitas tersimpan. Simpan hasil ke History secara manual dari halaman Generator.</p>}
        </GlassCard>
        <GlassCard className="p-5">
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => A.go("generator")}><Sparkles size={16} />Buka Generator</Button>
            <Button onClick={() => A.exportRows("txt", true)}><Download size={16} />Export TXT</Button>
            <Button onClick={A.clearResults}><Eraser size={16} />Clear Results</Button>
            <Button onClick={openPalette}><Command size={16} />Command Palette</Button>
          </div>
        </GlassCard>
      </div>
      <Disclaimer />
    </div>
  );
}
