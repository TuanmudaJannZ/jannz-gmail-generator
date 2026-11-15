import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { DUR, EASE } from "./motion";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

type P = { open: boolean; onClose: () => void; label: string; role?: "dialog" | "alertdialog"; placement?: "top" | "center"; className?: string; children: ReactNode };

/**
 * Modal tunggal untuk seluruh aplikasi: scale-in + scrim blur, Escape, focus trap,
 * kunci scroll, dan `inert` pada konten latar agar tidak bisa diinteraksi.
 * Scrim dan dialog bersaudara (bukan induk-anak) supaya fade scrim tidak mematikan blur kaca dialog.
 */
export function Modal({ open, onClose, label, role = "dialog", placement = "center", className = "", children }: P) {
  const box = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const root = document.getElementById("root"), html = document.documentElement;
    const prev = document.activeElement as HTMLElement | null;
    root?.setAttribute("inert", ""); html.classList.add("modal-open");
    const focusables = () => Array.from(box.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((el) => el.getClientRects().length > 0);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) { e.preventDefault(); box.current?.focus(); return; }
      const first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (!box.current?.contains(a)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && (a === first || a === box.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key, true);
    const focusIn = () => { if (!box.current?.contains(document.activeElement)) (focusables()[0] ?? box.current)?.focus({ preventScroll: true }); };
    const raf = requestAnimationFrame(focusIn), retry = window.setTimeout(focusIn, 80); // cadangan bila fokus awal ditolak browser
    return () => {
      cancelAnimationFrame(raf); clearTimeout(retry); document.removeEventListener("keydown", key, true);
      root?.removeAttribute("inert"); html.classList.remove("modal-open");
      if (prev && prev.isConnected) prev.focus({ preventScroll: true });
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="modal-layer" data-place={placement} key="layer">
          <motion.div className="modal-scrim" aria-hidden="true" onClick={() => closeRef.current()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DUR.base, ease: "easeOut" }} />
          <motion.div ref={box} role={role} aria-modal="true" aria-label={label} tabIndex={-1} className={`glass modal-box ${className}`}
            initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 6, transition: { duration: DUR.fast, ease: "easeIn" } }}
            transition={{ duration: DUR.base + 0.03, ease: EASE }}>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
