import { useEffect, useRef } from "react";
import { useApp } from "./AppContext";

function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, ctx = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0, d = 1;
    const ps = Array.from({ length: matchMedia("(max-width:640px)").matches ? 22 : 46 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.5 + 0.4, s: Math.random() * 0.00006 + 0.00002, a: Math.random() * 0.5 + 0.2 }));
    const size = () => { d = Math.min(devicePixelRatio, 1.5); w = c.width = innerWidth * d; h = c.height = innerHeight * d; };
    size(); addEventListener("resize", size);
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      if (!document.hidden) for (const p of ps) {
        p.y -= p.s * 16; if (p.y < 0) { p.y = 1; p.x = Math.random(); }
        ctx.beginPath(); ctx.fillStyle = `rgba(167,139,250,${p.a})`; ctx.arc(p.x * w, p.y * h, p.r * d, 0, 7); ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 h-full w-full pointer-events-none" aria-hidden="true" />;
}

function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(pointer:fine)").matches) return;
    const m = (e: PointerEvent) => { if (ref.current) ref.current.style.transform = `translate(${e.clientX - 260}px,${e.clientY - 260}px)`; };
    addEventListener("pointermove", m, { passive: true });
    return () => removeEventListener("pointermove", m);
  }, []);
  return <div ref={ref} className="spotlight" aria-hidden="true" />;
}

export function Background() {
  const { settings } = useApp();
  return (
    <div className="bg-root" aria-hidden="true">
      <div className="aurora"><i className="blob b1" /><i className="blob b2" /><i className="blob b3" /></div>
      {settings.particles && !settings.reduceMotion && <Particles />}
      {settings.cursor && !settings.reduceMotion && <Spotlight />}
    </div>
  );
}
