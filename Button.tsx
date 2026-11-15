import { ButtonHTMLAttributes, MouseEvent } from "react";
import { Loader2 } from "lucide-react";
import { useApp } from "./AppContext";

const fine = typeof matchMedia !== "undefined" && matchMedia("(pointer:fine)").matches;

type P = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "glass" | "primary" | "danger"; loading?: boolean };
/** Ripple ditangani satu listener global (ripple.ts); tombol hanya mengurus suara, loading, dan efek magnetik. */
export function Button({ variant = "glass", loading, children, className = "", onClick, disabled, ...rest }: P) {
  const { sfx, settings } = useApp();
  const magnetic = fine && variant === "primary" && !settings.reduceMotion && settings.intensity > 0;
  const click = (e: MouseEvent<HTMLButtonElement>) => { sfx("click"); onClick?.(e); };
  const move = (e: MouseEvent<HTMLButtonElement>) => {
    if (!magnetic) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.1}px ${(e.clientY - r.top - r.height / 2) * 0.16}px`;
  };
  return (
    <button {...rest} disabled={disabled || loading} aria-busy={loading || undefined} onClick={click} onMouseMove={move} onMouseLeave={(e) => (e.currentTarget.style.translate = "")} className={`btn btn-${variant} ${className}`}>
      {loading && <Loader2 className="spin" size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}
