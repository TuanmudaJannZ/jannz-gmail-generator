import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { AppProvider, useApp } from "./AppContext";
import { Background } from "./Background";
import { FloatingNav } from "./FloatingNav";
import { CommandPalette } from "./CommandPalette";
import { HomePage } from "./HomePage";
import { GeneratorPage } from "./GeneratorPage";
import { HistoryPage } from "./HistoryPage";
import { HubPage } from "./HubPage";
import { registerSW } from "./pwa";
import { SettingsPage } from "./SettingsPage";
import { Toaster } from "./Toast";
import { initRipple } from "./ripple";
import { Settings as Cog } from "lucide-react";

function Shell() {
  const A = useApp();
  const [palette, setPalette] = useState(false);
  const [apply, setApply] = useState<{ run: () => void } | null>(null);
  useEffect(() => registerSW((run) => setApply({ run })), []);
  useEffect(() => initRipple(), []);
  useEffect(() => { // jeda animasi CSS saat tab tidak aktif
    const v = () => document.documentElement.classList.toggle("tab-hidden", document.hidden);
    v(); document.addEventListener("visibilitychange", v); return () => document.removeEventListener("visibilitychange", v);
  }, []);
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
        <main key={A.page} className="page-in">
            {A.page === "home" && <HomePage openPalette={() => setPalette(true)} />}
            {A.page === "generator" && <GeneratorPage />}
            {A.page === "hub" && <HubPage />}
            {A.page === "history" && <HistoryPage />}
            {A.page === "settings" && <SettingsPage />}
          </main>
      </div>
      <FloatingNav />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      {apply && (
        <div className="update-banner glass" role="status">
          <div className="min-w-0"><p className="text-sm font-medium">{A.t("pwa.update")}</p><p className="muted text-xs">{A.t("pwa.warn")}</p></div>
          <button className="btn btn-glass" onClick={() => setApply(null)}>{A.t("pwa.later")}</button>
          <button className="btn btn-primary" onClick={apply.run}>{A.t("pwa.reload")}</button>
        </div>
      )}
      <Toaster />
    </MotionConfig>
  );
}
export default function App() { return <AppProvider><Shell /></AppProvider>; }
