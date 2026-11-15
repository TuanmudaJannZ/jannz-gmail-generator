import { useCallback, useEffect, useState } from "react";
import { load, save } from "./storage";
export type Settings = { theme: "dark" | "light"; intensity: number; reduceMotion: boolean; sound: boolean; particles: boolean; cursor: boolean; blur: number; accent: string; compact: boolean; font: "fluid" | "techno" | "classic"; lang: "id" | "en" };
const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer:coarse)").matches;
export const DEFAULTS: Settings = { theme: "dark", intensity: 1, reduceMotion: false, sound: false, particles: !coarse, cursor: !coarse, blur: 22, accent: "#6C8CFF", compact: false, font: "fluid", lang: typeof navigator !== "undefined" && (navigator.language || "").toLowerCase().startsWith("en") ? "en" : "id" };
export function useSettings(): [Settings, (p: Partial<Settings>) => void, () => void] {
  const [s, setS] = useState<Settings>(() => ({ ...DEFAULTS, ...load<Partial<Settings>>("jannz.settings", {}) }));
  useEffect(() => {
    save("jannz.settings", s);
    const r = document.documentElement;
    r.dataset.theme = s.theme; r.dataset.compact = String(s.compact); r.dataset.font = s.font; r.lang = s.lang; r.dataset.reduce = String(s.reduceMotion);
    r.style.setProperty("--blur", s.blur + "px"); r.style.setProperty("--primary", s.accent); r.style.setProperty("--primary-rgb", [1, 3, 5].map((i) => parseInt(s.accent.slice(i, i + 2), 16)).join(" ")); r.style.setProperty("--intensity", String(s.intensity));
  }, [s]);
  const update = useCallback((p: Partial<Settings>) => setS((o) => ({ ...o, ...p })), []);
  const reset = useCallback(() => setS(DEFAULTS), []);
  return [s, update, reset];
}
