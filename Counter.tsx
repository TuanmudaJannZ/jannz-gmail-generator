import { useEffect, useRef, useState } from "react";
import { useApp } from "./AppContext";
export function Counter({ value }: { value: number }) {
  const { settings } = useApp();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (settings.reduceMotion || settings.intensity === 0) { setShown(value); from.current = value; return; }
    const start = performance.now(), a = from.current, dur = 600; let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(a + (value - a) * e));
      if (p < 1) raf = requestAnimationFrame(tick); else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, settings.reduceMotion, settings.intensity]);
  return <>{shown.toLocaleString("id-ID")}</>;
}
