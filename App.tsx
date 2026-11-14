import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { AppProvider, useApp } from "./AppContext";
import { Background } from "./Background";
import { FloatingNav } from "./FloatingNav";
import { CommandPalette } from "./CommandPalette";
import { HomePage } from "./HomePage";
import { GeneratorPage } from "./GeneratorPage";
import { HistoryPage } from "./HistoryPage";
import { SettingsPage } from "./SettingsPage";
import { Settings as Cog } from "lucide-react";

function Shell() {
  const A = useApp();
  const [palette, setPalette] = useState(false);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((o) => !o); } };
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
  }, []);
  return (
    <MotionConfig reducedMotion={A.settings.reduceMotion ? "always" : "user"}>
      <Background />
      <div className="app">
        <div className="topbar">
          <div className="flex items-center gap-3">
            <div className="logo" aria-hidden="true">J</div>
            <div className="leading-tight"><p className="font-semibold">JannZ</p><p className="muted text-xs">Gmail Generator</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="status glass-lite" title="Semua proses berjalan lokal di browser"><i />Local • Offline-ready</span>
            <button className="icon-btn" onClick={() => setPalette(true)} aria-label="Buka command palette (Ctrl+K)"><kbd className="kbd">⌘K</kbd></button>
            <button className="icon-btn" onClick={() => A.go("settings")} aria-label="Pengaturan"><Cog size={18} /></button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.main key={A.page} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            {A.page === "home" && <HomePage openPalette={() => setPalette(true)} />}
            {A.page === "generator" && <GeneratorPage />}
            {A.page === "history" && <HistoryPage />}
            {A.page === "settings" && <SettingsPage />}
          </motion.main>
        </AnimatePresence>
      </div>
      <FloatingNav />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <div className="toast-wrap" aria-live="polite">
        <AnimatePresence>
          {A.toastMsg && (
            <motion.div key={A.toastMsg.id} className="glass toast" initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
              <CheckCircle2 size={18} className="text-[var(--accent)]" />{A.toastMsg.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
export default function App() { return <AppProvider><Shell /></AppProvider>; }
