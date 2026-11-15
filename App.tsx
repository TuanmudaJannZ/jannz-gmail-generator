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
            <img src="/favicon.svg" alt="" width={38} height={38} className="logo-img" />
            <div className="leading-tight"><p className="font-display text-[15px]">JannZ</p><p className="muted text-xs">Gmail Generator</p></div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="status glass-lite" title={A.t("app.statusTip")}><i />{A.t("app.status")}</span>
            <button className="icon-btn" onClick={() => setPalette(true)} aria-label={A.t("app.palette")}><kbd className="kbd">⌘K</kbd></button>
            <button className="icon-btn" onClick={() => A.go("settings")} aria-label={A.t("app.settings")}><Cog size={18} /></button>
          </div>
        </div>
        <motion.main key={A.page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            {A.page === "home" && <HomePage openPalette={() => setPalette(true)} />}
            {A.page === "generator" && <GeneratorPage />}
            {A.page === "history" && <HistoryPage />}
            {A.page === "settings" && <SettingsPage />}
          </motion.main>
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
