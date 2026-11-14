import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen, Trash2 } from "lucide-react";
import { useApp } from "./AppContext";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";

export function HistoryPage() {
  const A = useApp();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">History</h1>
        {A.history.length > 0 && <Button variant="danger" onClick={() => setConfirm(true)}><Trash2 size={16} />Clear All</Button>}
      </div>
      <p className="muted text-sm">Riwayat hanya disimpan di perangkat ini (localStorage) dan hanya jika Anda menekan “Simpan ke History”.</p>
      {A.history.length === 0 && <GlassCard tilt={false} className="p-8 text-center muted">Riwayat kosong.</GlassCard>}
      <ul className="space-y-3">
        {A.history.map((h, i) => (
          <motion.li key={h.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GlassCard tilt={false} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="mono text-sm break-all">{h.original}</p>
                <p className="muted text-xs mt-1">{new Date(h.date).toLocaleString("id-ID")} · {h.total.toLocaleString("id-ID")} variasi · {h.limit.toLocaleString("id-ID")} ditampilkan</p>
              </div>
              <Button variant="primary" onClick={() => A.openHistory(h)}><FolderOpen size={16} />Buka</Button>
              <Button aria-label="Hapus item" onClick={() => A.deleteHistory(h.id)}><Trash2 size={16} /></Button>
            </GlassCard>
          </motion.li>
        ))}
      </ul>
      <AnimatePresence>
        {confirm && (
          <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setConfirm(false)}>
            <motion.div role="alertdialog" aria-modal="true" aria-label="Konfirmasi hapus riwayat" className="glass p-6 max-w-sm w-[90%]" onMouseDown={(e) => e.stopPropagation()} initial={{ scale: 0.94, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}>
              <h2 className="font-semibold text-lg">Hapus semua riwayat?</h2>
              <p className="muted text-sm mt-2">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-2 justify-end mt-5">
                <Button onClick={() => setConfirm(false)}>Batal</Button>
                <Button variant="danger" onClick={() => { A.clearHistory(); setConfirm(false); }}>Hapus semua</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
