import { useCallback, useEffect, useState } from "react";
import { KEYS, loadValidated, save } from "./storage";
import { onPrimary } from "./color";
export type Settings = { theme: "dark" | "light"; intensity: number; reduceMotion: boolean; sound: boolean; particles: boolean; cursor: boolean; blur: number; accent: string; compact: boolean; font: "fluid" | "techno" | "classic"; lang: "id" | "en" };
const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer:coarse)").matches;
export const DEFAULTS: Settings = { theme: "dark", intensity: 1, reduceMotion: false, sound: false, particles: !coarse, cursor: !coarse, blur: 22, accent: "#6C8CFF", compact: false, font: "fluid", lang: typeof navigator !== "undefined" && (navigator.language || "").toLowerCase().startsWith("en") ? "en" : "id" };
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
/** Validasi tiap field; nilai tidak valid diganti bawaan. Objek yang bukan objek ditolak (null). */
export function sanitizeSettings(v: unknown): Settings | null {
  if (!isObj(v)) return null;
  const b = (k: keyof Settings) => (typeof v[k] === "boolean" ? (v[k] as boolean) : (DEFAULTS[k] as boolean));
  const oneOf = <T extends string>(x: unknown, list: readonly T[], d: T): T => (list.includes(x as T) ? (x as T) : d);
  const n = (x: unknown, lo: number, hi: number, d: number) => (typeof x === "number" && Number.isFinite(x) ? Math.round(Math.min(hi, Math.max(lo, x))) : d);
  return {
    theme: oneOf(v.theme, ["dark", "light"], DEFAULTS.theme), intensity: n(v.intensity, 0, 2, DEFAULTS.intensity), reduceMotion: b("reduceMotion"), sound: b("sound"),
    particles: b("particles"), cursor: b("cursor"), blur: n(v.blur, 6, 40, DEFAULTS.blur), accent: typeof v.accent === "string" && /^#[0-9a-fA-F]{6}$/.test(v.accent) ? v.accent : DEFAULTS.accent,
    compact: b("compact"), font: oneOf(v.font, ["fluid", "techno", "classic"], DEFAULTS.font), lang: oneOf(v.lang, ["id", "en"], DEFAULTS.lang),
  };
}
export function useSettings(): [Settings, (p: Partial<Settings>) => void, () => void] {
  const [s, setS] = useState<Settings>(() => loadValidated(KEYS.settings, DEFAULTS, sanitizeSettings));
  useEffect(() => {
    save(KEYS.settings, s);
    const r = document.documentElement;
    r.dataset.theme = s.theme; r.dataset.compact = String(s.compact); r.dataset.font = s.font; r.lang = s.lang; r.dataset.reduce = String(s.reduceMotion); r.dataset.anim = String(s.intensity);
    r.style.setProperty("--blur", s.blur + "px"); r.style.setProperty("--primary", s.accent); r.style.setProperty("--primary-rgb", [1, 3, 5].map((i) => parseInt(s.accent.slice(i, i + 2), 16)).join(" ")); r.style.setProperty("--intensity", String(s.intensity));
    const op = onPrimary(s.accent); r.style.setProperty("--on-primary", op.text); r.style.setProperty("--primary-shade", String(op.shade));
  }, [s]);
  const update = useCallback((p: Partial<Settings>) => setS((o) => ({ ...o, ...p })), []);
  const reset = useCallback(() => setS(DEFAULTS), []);
  return [s, update, reset];
}
