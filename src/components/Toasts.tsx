import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { useStore } from "../store/useStore";
import { useEffect } from "react";

const iconFor = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};
const colorFor = {
  info: "border-accent-blue/40 bg-accent-blue/10 text-accent-blue",
  warning: "border-status-warning/40 bg-status-warning/10 text-status-warning",
  critical: "border-status-critical/40 bg-status-critical/10 text-status-critical",
};

export default function Toasts() {
  const { toasts, dismissToast } = useStore();

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: { id: string; severity: "info" | "warning" | "critical"; message: string }; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 5000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  const Icon = iconFor[toast.severity];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`glass-panel p-3 border ${colorFor[toast.severity]} flex items-start gap-2.5`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 text-xs text-slate-200 leading-relaxed">{toast.message}</div>
      <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
