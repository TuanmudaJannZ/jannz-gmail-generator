let ctx: AudioContext | null = null;
const tones = { click: [520, 0.04], copy: [880, 0.08], done: [660, 0.12], nav: [440, 0.05] } as const;
export type Sfx = keyof typeof tones;
export function play(kind: Sfx) {
  try {
    ctx = ctx ?? new AudioContext();
    const [f, d] = tones[kind];
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = f; o.type = "sine";
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + d);
  } catch { /* audio tidak tersedia */ }
}
