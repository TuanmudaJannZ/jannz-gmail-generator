import { CSSProperties, MouseEvent, useState } from "react";
import { History, Home, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import { Page, useApp } from "./AppContext";
import type { Key } from "./i18n";

const items = [
  { id: "home", label: "nav.home", Icon: Home, fx: "glow" },
  { id: "generator", label: "nav.generator", Icon: Sparkles, fx: "spin" },
  { id: "hub", label: "nav.hub", Icon: LayoutDashboard, fx: "glow" },
  { id: "history", label: "nav.history", Icon: History, fx: "wave" },
  { id: "settings", label: "nav.settings", Icon: Settings, fx: "gear" },
] as const satisfies readonly { id: Page; label: Key; Icon: typeof Home; fx: string }[];

export function FloatingNav() {
  const { page, go, t } = useApp();
  const idx = items.findIndex((i) => i.id === page);
  const [drops, setDrops] = useState<{ id: number; x: number; y: number; item: Page }[]>([]);
  const press = (e: MouseEvent<HTMLButtonElement>, item: Page) => {
    const r = e.currentTarget.getBoundingClientRect();
    const kb = e.detail === 0;
    const d = { id: Date.now() + Math.random(), x: kb ? r.width / 2 : e.clientX - r.left, y: kb ? r.height / 2 : e.clientY - r.top, item };
    setDrops((a) => [...a, d]);
    setTimeout(() => setDrops((a) => a.filter((x) => x.id !== d.id)), 800);
    go(item);
  };
  return (
    <nav aria-label={t("nav.main")} className="float-nav glass" style={{ "--i": idx } as CSSProperties}>
      <span className="nav-slider" aria-hidden="true"><span key={page} className="nav-pill" /></span>
      {items.map(({ id, label, Icon, fx }) => {
        const active = page === id;
        return (
          <button key={id} onClick={(e) => press(e, id)} aria-current={active ? "page" : undefined} aria-label={t(label)} className={`nav-item ${active ? "active" : ""}`}>
            <span className={`ico relative z-10 flex ${active ? "fx-" + fx : ""}`}><Icon size={20} /></span>
            <span className="nav-label relative z-10">{t(label)}</span>
            {drops.filter((d) => d.item === id).map((d) => <span key={d.id} className="drop" style={{ left: d.x, top: d.y }}><i /></span>)}
          </button>
        );
      })}
    </nav>
  );
}
