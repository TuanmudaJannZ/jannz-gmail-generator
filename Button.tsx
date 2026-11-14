import { ButtonHTMLAttributes, MouseEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { useApp } from "./AppContext";

type P = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "glass" | "primary" | "danger"; loading?: boolean };
export function Button({ variant = "glass", loading, children, className = "", onClick, disabled, ...rest }: P) {
  const [rip, setRip] = useState<{ id: number; x: number; y: number }[]>([]);
  const { sfx } = useApp();
  const click = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRip((a) => [...a, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRip((a) => a.filter((x) => x.id !== id)), 650);
    sfx("click"); onClick?.(e);
  };
  const move = (e: MouseEvent<HTMLButtonElement>) => { // magnetic (desktop, tombol utama)
    if (variant !== "primary" || !matchMedia("(pointer:fine)").matches) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.1}px ${(e.clientY - r.top - r.height / 2) * 0.16}px`;
  };
  return (
    <button {...rest} disabled={disabled || loading} onClick={click} onMouseMove={move} onMouseLeave={(e) => (e.currentTarget.style.translate = "")} className={`btn btn-${variant} ${className}`}>
      {loading && <Loader2 className="spin" size={16} />}
      {children}
      {rip.map((r) => <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />)}
    </button>
  );
}
