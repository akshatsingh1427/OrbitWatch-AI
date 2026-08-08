import { motion } from "framer-motion";
import { Bell, TriangleAlert } from "lucide-react";
import type { AlertRow } from "../../api/riskApi";
import { Skeleton } from "../ui";
import { RiskBadge } from "./RiskVisuals";

interface Props {
  alerts: AlertRow[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (noradId: number) => void;
}

export default function AlertCenter({ alerts, isLoading, isError, onSelect }: Props) {
  return (
    <div className="glass-panel glass-panel-hover relative overflow-hidden p-4 h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-status-critical/50 to-transparent" />

      <div className="flex items-center gap-2 mb-3.5">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-status-critical/10 border border-status-critical/20">
          <Bell className="w-3.5 h-3.5 text-status-critical" />
        </span>
        <h3 className="text-xs font-semibold tracking-widest text-slate-300 uppercase">Alert Center</h3>
        {!isLoading && !isError && (
          <span className="text-[10px] font-mono text-slate-500">({alerts.length})</span>
        )}
      </div>

      <div className="space-y-2 overflow-y-auto scrollbar-thin max-h-72 pr-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : isError ? (
          <p className="text-xs text-status-critical py-4 text-center">Alert feed unavailable.</p>
        ) : alerts.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No active high-risk alerts.</p>
        ) : (
          alerts.map((alert, i) => (
            <motion.button
              key={`${alert.norad_id}-${i}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => onSelect(alert.norad_id)}
              className="w-full text-left rounded-lg border border-space-border bg-space-bg/50 hover:border-status-critical/40 hover:bg-space-hover/30 hover:shadow-[0_0_16px_-4px_rgba(239,68,68,0.35)] transition-all p-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <TriangleAlert className="w-3.5 h-3.5 text-status-critical shrink-0" />
                  <span className="text-xs text-slate-200 truncate">{alert.object_name}</span>
                </div>
                <RiskBadge probability={alert.risk_probability} />
              </div>
              <p className="mt-1 text-[10px] font-mono text-slate-500">
                NORAD {alert.norad_id} · {(alert.risk_probability * 100).toFixed(1)}% probability
              </p>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
