import { MouseEvent, useState } from "react";
import { motion } from "framer-motion";
import { History, Home, Settings, Sparkles } from "lucide-react";
import { Page, useApp } from "./AppContext";

const items = [
  { id: "home", label: "Home", Icon: Home, fx: "glow" },
  { id: "generator", label: "Generator", Icon: Sparkles, fx: "spin" },
  { id: "history", label: "History", Icon: History, fx: "wave" },
  { id: "settings", label: "Settings", Icon: Settings, fx: "gear" },
] as const;

export function FloatingNav() {
  const { page, go } = useApp();
  const [drops, setDrops] = useState<{ id: number; x: number; y: number; item: Page }[]>([]);
  const press = (e: MouseEvent<HTMLButtonElement>, item: Page) => {
    const r = e.currentTarget.getBoundingClientRect();
    const kb = e.detail === 0; // aktivasi lewat keyboard -> tetes di tengah
    const d = { id: Date.now() + Math.random(), x: kb ? r.width / 2 : e.clientX - r.left, y: kb ? r.height / 2 : e.clientY - r.top, item };
    setDrops((a) => [...a, d]);
    setTimeout(() => setDrops((a) => a.filter((x) => x.id !== d.id)), 800);
    go(item);
  };
  return (
    <nav aria-label="Navigasi utama" className="float-nav glass">
      {items.map(({ id, label, Icon, fx }) => {
        const active = page === id;
        return (
          <motion.button key={id} whileTap={{ scale: 0.9 }} transition={{ type: "spring", stiffness: 500, damping: 22 }} onClick={(e) => press(e, id)} aria-current={active ? "page" : undefined} aria-label={label} className={`nav-item ${active ? "active" : ""}`}>
            {active && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.9 }} />}
            <span className={`ico relative z-10 flex ${active ? "fx-" + fx : ""}`}><Icon size={19} /></span>
            <span className={`relative z-10 text-[13px] font-medium ${active ? "" : "hidden min-[400px]:inline"}`}>{label}</span>
            {drops.filter((d) => d.item === id).map((d) => <span key={d.id} className="drop" style={{ left: d.x, top: d.y }}><i /></span>)}
          </motion.button>
        );
      })}
    </nav>
  );
}
