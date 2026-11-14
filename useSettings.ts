import { useCallback, useEffect, useState } from "react";
import { load, save } from "./storage";
export type Settings = { theme: "dark" | "light"; intensity: number; reduceMotion: boolean; sound: boolean; particles: boolean; cursor: boolean; blur: number; accent: string; compact: boolean };
export const DEFAULTS: Settings = { theme: "dark", intensity: 1, reduceMotion: false, sound: false, particles: true, cursor: true, blur: 22, accent: "#6C8CFF", compact: false };
export function useSettings(): [Settings, (p: Partial<Settings>) => void, () => void] {
  const [s, setS] = useState<Settings>(() => ({ ...DEFAULTS, ...load<Partial<Settings>>("jannz.settings", {}) }));
  useEffect(() => {
    save("jannz.settings", s);
    const r = document.documentElement;
    r.dataset.theme = s.theme; r.dataset.compact = String(s.compact); r.dataset.reduce = String(s.reduceMotion);
    r.style.setProperty("--blur", s.blur + "px"); r.style.setProperty("--primary", s.accent); r.style.setProperty("--intensity", String(s.intensity));
  }, [s]);
  const update = useCallback((p: Partial<Settings>) => setS((o) => ({ ...o, ...p })), []);
  const reset = useCallback(() => setS(DEFAULTS), []);
  return [s, update, reset];
}
