import { CSSProperties, memo, MouseEvent, ReactNode, useEffect, useRef } from "react";
import { useApp } from "./AppContext";

const fine = typeof matchMedia !== "undefined" && matchMedia("(pointer:fine)").matches;

/** `tilt`: miring 3D mengikuti kursor. `lift`: terangkat saat hover (default ikut `tilt`, kartu besar/daftar tidak ikut). Animasi masuk ditangani CSS (.page-in). */
type P = { children: ReactNode; className?: string; tilt?: boolean; lift?: boolean; delay?: number; "aria-busy"?: boolean };
export const GlassCard = memo(function GlassCard({ children, className = "", tilt = true, lift, delay = 0, "aria-busy": busy }: P) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const { settings } = useApp();
  const k = settings.reduceMotion ? 0 : settings.intensity;
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const move = (e: MouseEvent<HTMLDivElement>) => {
    if (!fine || raf.current) return;
    const cx = e.clientX, cy = e.clientY;
    raf.current = requestAnimationFrame(() => { // satu pembacaan layout per frame
      raf.current = 0;
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(), x = (cx - r.left) / r.width, y = (cy - r.top) / r.height;
      el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
      if (tilt && k > 0) el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5 * k}deg) rotateY(${(x - 0.5) * 5 * k}deg)`;
    });
  };
  const leave = () => { cancelAnimationFrame(raf.current); raf.current = 0; if (ref.current) ref.current.style.transform = ""; };
  const style = delay > 0 && k > 0 ? ({ "--d": `${(delay * k).toFixed(3)}s` } as CSSProperties) : undefined;
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} aria-busy={busy} style={style} className={`glass card-tilt ${(lift ?? tilt) ? "card-lift" : ""} ${className}`}>{children}</div>
  );
});
