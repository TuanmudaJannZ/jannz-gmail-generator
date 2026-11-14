import { memo, MouseEvent, ReactNode, useRef } from "react";
import { motion } from "framer-motion";
import { useApp } from "./AppContext";

type P = { children: ReactNode; className?: string; tilt?: boolean; delay?: number; "aria-busy"?: boolean };
export const GlassCard = memo(function GlassCard({ children, className = "", tilt = true, delay = 0, "aria-busy": busy }: P) {
  const ref = useRef<HTMLDivElement>(null);
  const { settings } = useApp();
  const k = settings.reduceMotion ? 0 : settings.intensity;
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el || !matchMedia("(pointer:fine)").matches) return;
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
    if (tilt && k > 0) el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5 * k}deg) rotateY(${(x - 0.5) * 5 * k}deg) translateY(-2px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: k ? 0.5 : 0.01, delay: delay * k, ease: [0.22, 1, 0.36, 1] }}>
      <div ref={ref} onMouseMove={move} onMouseLeave={leave} aria-busy={busy} className={`glass card-tilt ${className}`}>{children}</div>
    </motion.div>
  );
});
