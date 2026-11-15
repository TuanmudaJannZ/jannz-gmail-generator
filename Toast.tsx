import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "./AppContext";
import { DUR, EASE } from "./motion";

const ICON = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info } as const;

/** Satu toast pada satu waktu (tanpa penumpukan): pesan baru menggantikan yang lama dengan transisi halus. */
export function Toaster() {
  const { toastMsg } = useApp();
  const Icon = toastMsg ? ICON[toastMsg.type] : null;
  return (
    <div className="toast-wrap" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {toastMsg && Icon && (
          <motion.div key={toastMsg.id} role={toastMsg.type === "error" || toastMsg.type === "warning" ? "alert" : "status"} data-type={toastMsg.type} className="glass toast"
            initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: DUR.fast, ease: "easeIn" } }}
            transition={{ duration: DUR.base + 0.05, ease: EASE }}>
            <Icon size={18} aria-hidden="true" />{toastMsg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
