import { useCallback, useRef, useState } from "react";
import { cleanGroup, dayKey, emptyStats, type Favorite, KEYS, loadValidated, MAX_FAV, remove, sanitizeFavorites, sanitizeStats, save, type Stats, type LogKind } from "./storage";

/** Favorit (dengan grup) dan statistik nyata. Hanya menyimpan apa yang benar-benar terjadi; tidak ada angka bawaan. */
export function useLibrary(onFail: () => void) {
  const [favorites, setFavorites] = useState<Favorite[]>(() => loadValidated<Favorite[]>(KEYS.favorites, [], sanitizeFavorites));
  const [stats, setStats] = useState<Stats>(() => loadValidated<Stats>(KEYS.stats, emptyStats(), sanitizeStats));
  const favRef = useRef(favorites); favRef.current = favorites;
  const statsRef = useRef(stats); statsRef.current = stats;

  const putFav = useCallback((f: Favorite[]) => { favRef.current = f; setFavorites(f); if (!save(KEYS.favorites, f)) onFail(); }, [onFail]);
  const putStats = useCallback((s: Stats) => { statsRef.current = s; setStats(s); save(KEYS.stats, s); }, []);

  /** Mengembalikan jumlah yang benar-benar ditambahkan (duplikat dilewati) dan jumlah duplikat. */
  const addFavorites = useCallback((emails: string[], group = "") => {
    const have = new Set(favRef.current.map((f) => f.email)), now = new Date().toISOString(), g = cleanGroup(group), fresh: Favorite[] = [];
    for (const e of emails) if (!have.has(e) && fresh.length + favRef.current.length < MAX_FAV) { have.add(e); fresh.push({ email: e, date: now, group: g }); }
    if (fresh.length) putFav([...fresh, ...favRef.current]);
    return { added: fresh.length, dup: emails.length - fresh.length };
  }, [putFav]);
  const removeFavorites = useCallback((emails: string[]) => { const s = new Set(emails); putFav(favRef.current.filter((f) => !s.has(f.email))); }, [putFav]);
  const toggleFavorite = useCallback((email: string) => {
    if (favRef.current.some((f) => f.email === email)) { removeFavorites([email]); return false; }
    addFavorites([email]); return true;
  }, [addFavorites, removeFavorites]);
  const setGroup = useCallback((emails: string[], group: string) => { const s = new Set(emails), g = cleanGroup(group); putFav(favRef.current.map((f) => (s.has(f.email) ? { ...f, group: g } : f))); }, [putFav]);
  const clearFavorites = useCallback(() => { favRef.current = []; setFavorites([]); remove(KEYS.favorites); }, []);
  const replaceFavorites = putFav;

  const track = useCallback((k: LogKind, n: number, d?: string) => {
    if (n <= 0) return;
    const s = statsRef.current, now = new Date(), day = dayKey(now), cur = s.daily[day] ?? { g: 0, c: 0, e: 0 };
    const daily = { ...s.daily, [day]: { g: cur.g + (k === "generate" ? n : 0), c: cur.c + (k === "copy" ? n : 0), e: cur.e + (k === "export" ? n : 0) } };
    const keep = Object.keys(daily).sort().slice(-14), d2: Stats["daily"] = {}; keep.forEach((x) => (d2[x] = daily[x]));
    putStats({
      generated: s.generated + (k === "generate" ? n : 0), saved: s.saved + (k === "save" ? n : 0), copied: s.copied + (k === "copy" ? n : 0), exported: s.exported + (k === "export" ? n : 0),
      daily: d2, log: [{ t: now.toISOString(), k, n, d }, ...s.log].slice(0, 20),
    });
  }, [putStats]);
  const resetStats = useCallback(() => { statsRef.current = emptyStats(); setStats(statsRef.current); remove(KEYS.stats); }, []);
  const replaceStats = putStats;

  return { favorites, stats, addFavorites, removeFavorites, toggleFavorite, setGroup, clearFavorites, replaceFavorites, track, resetStats, replaceStats };
}
