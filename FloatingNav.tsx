import { motion } from "framer-motion";
import { History, Home, Settings, Sparkles } from "lucide-react";
import { Page, useApp } from "./AppContext";

const items: { id: Page; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home }, { id: "generator", label: "Generator", Icon: Sparkles },
  { id: "history", label: "History", Icon: History }, { id: "settings", label: "Settings", Icon: Settings },
];
export function FloatingNav() {
  const { page, go } = useApp();
  return (
    <nav aria-label="Navigasi utama" className="float-nav glass">
      {items.map(({ id, label, Icon }) => {
        const active = page === id;
        return (
          <button key={id} onClick={() => go(id)} aria-current={active ? "page" : undefined} aria-label={label} className={`nav-item ${active ? "active" : ""}`}>
            {active && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
            <motion.span whileHover={{ scale: 1.15, rotate: -6 }} whileTap={{ scale: 0.9 }} className="relative z-10 flex"><Icon size={19} /></motion.span>
            <span className={`relative z-10 text-sm font-medium ${active ? "" : "hidden sm:inline"}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
