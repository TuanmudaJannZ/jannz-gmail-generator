import { memo, useEffect, useMemo, useState } from "react";
import { Copy, Search, Trash2 } from "lucide-react";
import { useApp } from "./AppContext";
import { useDebounced } from "./useDebounced";
import type { Favorite } from "./storage";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";
import { Modal } from "./Modal";
import { Pager } from "./Pager";

const SIZES = [20, 50, 100];
const FavRow = memo(function FavRow({ f, checked, onToggle, onCopy, onDelete, labels }: { f: Favorite; checked: boolean; onToggle: (e: string) => void; onCopy: (e: string) => void; onDelete: (e: string) => void; labels: { pick: string; copy: string; del: string } }) {
  return (
    <li className={`row glass-lite ${checked ? "selected" : ""}`}>
      <label className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer">
        <input type="checkbox" className="check" checked={checked} onChange={() => onToggle(f.email)} aria-label={labels.pick} />
        <span className="mono text-sm truncate">{f.email}</span>
      </label>
      {f.group && <span className="chip truncate max-w-[110px]">{f.group}</span>}
      <button className="icon-btn" aria-label={labels.copy} onClick={() => onCopy(f.email)}><Copy size={16} /></button>
      <button className="icon-btn" aria-label={labels.del} onClick={() => onDelete(f.email)}><Trash2 size={16} /></button>
    </li>
  );
});

export function FavoritesPanel() {
  const A = useApp(), { t, fmt, favorites } = A;
  const [q, setQ] = useState(""), dq = useDebounced(q.trim().toLowerCase(), 200);
  const [group, setGroup] = useState("*"), [sort, setSort] = useState<"new" | "old" | "az">("new");
  const [sel, setSel] = useState<Set<string>>(new Set()), [page, setPage] = useState(1), [size, setSize] = useState(20);
  const [name, setName] = useState(""), [confirm, setConfirm] = useState<null | "sel" | "all">(null);

  const groups = useMemo(() => Array.from(new Set(favorites.map((f) => f.group).filter(Boolean))).sort(), [favorites]);
  const view = useMemo(() => {
    let r = favorites;
    if (dq) r = r.filter((f) => f.email.includes(dq) || f.group.toLowerCase().includes(dq));
    if (group === "") r = r.filter((f) => !f.group); else if (group !== "*") r = r.filter((f) => f.group === group);
    if (sort === "old") r = [...r].reverse(); else if (sort === "az") r = [...r].sort((a, b) => (a.email < b.email ? -1 : 1));
    return r;
  }, [favorites, dq, group, sort]);
  useEffect(() => setPage(1), [dq, group, sort, size]);
  useEffect(() => { if (group !== "*" && group !== "" && !groups.includes(group)) setGroup("*"); }, [groups, group]);

  const selList = useMemo(() => favorites.filter((f) => sel.has(f.email)).map((f) => f.email), [favorites, sel]);
  const pages = Math.max(1, Math.ceil(view.length / size)), cur = Math.min(page, pages), slice = view.slice((cur - 1) * size, cur * size);
  const toggle = (e: string) => setSel((s) => { const x = new Set(s); x.has(e) ? x.delete(e) : x.add(e); return x; });
  const copy = (list: string[]) => A.copy(list.join("\n"), list.length);
  const apply = () => { if (!selList.length) return; A.setFavGroup(selList, name); A.toast(t("fav.grouped"), "info"); setName(""); };

  if (!favorites.length) return <GlassCard tilt={false} className="p-8 text-center muted">{t("fav.empty")}</GlassCard>;
  return (
    <GlassCard tilt={false} className="p-4 sm:p-5">
      <p className="muted text-sm mb-3">{t("fav.count", { n: fmt(favorites.length), s: fmt(selList.length) })}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="field flex-1 min-w-[160px]"><Search size={16} className="muted" /><input className="bare-input mono text-sm" placeholder={t("res.search")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t("res.search")} /></div>
        <select className="select" value={group} onChange={(e) => setGroup(e.target.value)} aria-label={t("fav.groupFilter")}>
          <option value="*">{t("fav.groupAll")}</option><option value="">{t("fav.groupNone")}</option>{groups.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={t("res.sort")}>
          <option value="new">{t("fav.sortNew")}</option><option value="old">{t("fav.sortOld")}</option><option value="az">{t("res.az")}</option>
        </select>
        <select className="select" value={size} onChange={(e) => setSize(Number(e.target.value))} aria-label={t("res.pageSize")}>{SIZES.map((n) => <option key={n} value={n}>{n} / {t("res.pageUnit")}</option>)}</select>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button onClick={() => setSel(new Set(view.map((f) => f.email)))}>{t("res.selectAll")}</Button>
        <Button onClick={() => setSel(new Set())} disabled={!selList.length}>{t("res.deselectAll")}</Button>
        <Button variant="primary" onClick={() => copy(selList.length ? selList : view.map((f) => f.email))}><Copy size={16} />{t("fav.copy", { n: fmt(selList.length || view.length) })}</Button>
        <Button variant="danger" disabled={!selList.length} onClick={() => setConfirm("sel")}><Trash2 size={16} />{t("fav.deleteSel")}</Button>
        <Button variant="danger" onClick={() => setConfirm("all")}>{t("fav.deleteAll")}</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="field flex-1 min-w-[160px]"><input className="bare-input text-sm" maxLength={24} placeholder={t("fav.groupName")} value={name} onChange={(e) => setName(e.target.value)} aria-label={t("fav.groupName")} list="fav-groups" /><datalist id="fav-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist></div>
        <Button disabled={!selList.length} onClick={apply}>{t("fav.apply")}</Button>
      </div>
      <ul className="space-y-2" aria-label={t("hub.tab.fav")}>
        {slice.map((f) => <FavRow key={f.email} f={f} checked={sel.has(f.email)} onToggle={toggle} onCopy={(e) => copy([e])} onDelete={(e) => A.removeFavorites([e])} labels={{ pick: t("res.pick", { email: f.email }), copy: t("res.copyOne"), del: t("fav.unstar") }} />)}
        {!slice.length && <li className="muted text-center p-6 text-sm">{t("res.none")}</li>}
      </ul>
      <Pager cur={cur} pages={pages} onPage={setPage} label={t("res.page", { cur: fmt(cur), pages: fmt(pages), n: fmt(view.length) })} />
      <Modal open={!!confirm} onClose={() => setConfirm(null)} role="alertdialog" label={t("fav.confirmTitle")} className="p-6 max-w-sm w-full">
        <h2 className="text-lg">{t("fav.confirmTitle")}</h2>
        <p className="muted text-sm mt-2">{t("fav.confirmBody", { n: fmt(confirm === "all" ? favorites.length : selList.length) })}</p>
        <div className="flex gap-2 justify-end mt-5">
          <Button onClick={() => setConfirm(null)}>{t("set.cancel")}</Button>
          <Button variant="danger" onClick={() => { if (confirm === "all") A.clearFavorites(); else A.removeFavorites(selList); setSel(new Set()); setConfirm(null); A.toast(t("fav.removed"), "info"); }}>{t("hist.deleteAll")}</Button>
        </div>
      </Modal>
    </GlassCard>
  );
}
