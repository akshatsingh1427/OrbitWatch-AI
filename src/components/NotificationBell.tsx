import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, AlertTriangle, Info, AlertCircle, X, ShieldAlert } from "lucide-react";
import { useStore } from "../store/useStore";
import { useAlerts } from "../hooks/useRiskData";
import { RiskBadge } from "./risk/RiskVisuals";

const severityIcon = { info: Info, warning: AlertTriangle, critical: AlertCircle };
const severityColor = {
  info: "text-accent-blue border-accent-blue/30 bg-accent-blue/5",
  warning: "text-status-warning border-status-warning/30 bg-status-warning/5",
  critical: "text-status-critical border-status-critical/30 bg-status-critical/5",
};

export default function NotificationBell() {
  const { alerts, unreadAlertCount, clearUnread, notifOpen, setNotifOpen, setInspectNoradId, setActiveTab } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const riskAlerts = useAlerts(5);

  // close on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen, setNotifOpen]);

  const handleOpen = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) clearUnread();
  };

  const recent = alerts.slice(0, 8);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
          notifOpen
            ? "bg-accent-blue/20 text-accent-cyan"
            : "text-slate-400 hover:text-slate-200 hover:bg-space-hover/40"
        }`}
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadAlertCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-status-critical text-[9px] font-bold text-white px-0.5 font-mono"
          >
            {unreadAlertCount > 99 ? "99+" : unreadAlertCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 top-10 w-80 glass-panel border-accent-blue/20 shadow-[0_0_40px_-8px_rgba(59,130,246,0.3)] overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-space-border">
              <span className="text-xs font-display font-semibold tracking-widest text-slate-300 uppercase">
                Alert Log
              </span>
              <button
                onClick={() => setNotifOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {/* Real AI risk alerts from the backend */}
              {(riskAlerts.data?.length ?? 0) > 0 && (
                <div className="border-b border-space-border/60">
                  <div className="px-4 pt-2.5 pb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3 text-status-critical" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">
                      AI Risk Alerts
                    </span>
                  </div>
                  {riskAlerts.data!.map((a, i) => (
                    <button
                      key={`${a.norad_id}-${i}`}
                      onClick={() => {
                        setInspectNoradId(a.norad_id);
                        setActiveTab("risk");
                        setNotifOpen(false);
                      }}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2 text-left hover:bg-space-hover/30 transition-colors"
                    >
                      <span className="text-xs text-slate-300 truncate">{a.object_name}</span>
                      <RiskBadge probability={a.risk_probability} />
                    </button>
                  ))}
                </div>
              )}

              {recent.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-slate-500">No alerts</div>
              )}
              {recent.map((alert) => {
                const Icon = severityIcon[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-space-border/50 last:border-0 ${severityColor[alert.severity]}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-200 font-display">{alert.source}</span>
                        <span className="text-[9px] font-mono text-slate-500 shrink-0">
                          {new Date(alert.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-2 border-t border-space-border">
              <span className="text-[10px] text-slate-600 font-mono">{alerts.length} total events logged</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
