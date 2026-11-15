/**
 * Ripple tunggal (delegasi event): satu listener untuk semua tombol, tanpa state React per tombol.
 * Titik asal = titik sentuh/klik. Hanya transform + opacity (dikomposit GPU), elemen dibuang saat animasi selesai.
 */
const SEL = ".btn, .icon-btn, .cmd-item, button.row";

export function initRipple(): () => void {
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = (e.target as Element | null)?.closest<HTMLElement>(SEL);
    if (!el || (el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true") return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const d = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) * 2; // menutupi sudut terjauh
    const s = document.createElement("span");
    s.className = "ripple"; s.setAttribute("aria-hidden", "true");
    s.style.cssText = `left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px`;
    el.appendChild(s);
    const done = () => s.remove();
    s.addEventListener("animationend", done, { once: true });
    window.setTimeout(done, 900); // jaga-jaga bila animasi dimatikan (reduced motion)
  };
  document.addEventListener("pointerdown", onDown, { passive: true });
  return () => document.removeEventListener("pointerdown", onDown);
}
