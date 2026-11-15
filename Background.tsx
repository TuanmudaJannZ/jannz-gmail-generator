import { useEffect, useMemo, useRef } from "react";
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
      for (const p of ps) {
        p.y -= p.s * 16; if (p.y < 0) { p.y = 1; p.x = Math.random(); }
        ctx.beginPath(); ctx.fillStyle = `rgba(167,139,250,${p.a})`; ctx.arc(p.x * w, p.y * h, p.r * d, 0, 7); ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) loop(); }; // loop berhenti total saat tab tidak aktif
    document.addEventListener("visibilitychange", vis);
    vis();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); document.removeEventListener("visibilitychange", vis); };
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

/** Bintang statis via box-shadow (tanpa JS per-frame, hanya opacity berkedip) */
function layer(n: number, W: number, H: number) {
  const tints = ["255 255 255", "190 205 255", "215 190 255"];
  return Array.from({ length: n }, () => `${Math.round(Math.random() * W)}px ${Math.round(Math.random() * H)}px rgb(${tints[Math.floor(Math.random() * 3)]} / ${(0.4 + Math.random() * 0.6).toFixed(2)})`).join(",");
}

export function Background() {
  const { settings } = useApp();
  const small = typeof matchMedia !== "undefined" && matchMedia("(max-width:640px)").matches;
  const stars = useMemo(() => {
    const W = Math.max(innerWidth, screen.width), H = Math.max(innerHeight, screen.height);
    const k = small ? 0.6 : 1;
    return [layer(Math.round(90 * k), W, H), layer(Math.round(36 * k), W, H), layer(Math.round(12 * k), W, H)];
  }, [small]);
  return (
    <div className="bg-root" aria-hidden="true">
      <div className="nebula"><i className="blob b1" /><i className="blob b2" /></div>
      <div className="stars">
        <i className="st s1" style={{ boxShadow: stars[0] }} />
        <i className="st s2" style={{ boxShadow: stars[1] }} />
        <i className="st s3" style={{ boxShadow: stars[2] }} />
      </div>
      <div className="arc" />
      {settings.particles && !settings.reduceMotion && <Particles />}
      {settings.cursor && !settings.reduceMotion && <Spotlight />}
    </div>
  );
}
