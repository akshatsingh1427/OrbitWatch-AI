import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Heart, ArrowDown, ArrowUp, AlertTriangle, Info, AlertCircle, Activity, Search } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Panel, StatusBadge, statusDotColor } from "../ui";
import CommsHealthPanel from "../risk/CommsHealthPanel";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const linkStatusColor: Record<string, string> = {
  online: "text-status-nominal",
  degraded: "text-status-warning",
  offline: "text-status-critical",
};

const severityIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};
const severityColor = {
  info: "text-accent-blue",
  warning: "text-status-warning",
  critical: "text-status-critical",
};

export default function CommsTab() {
  const { comms, subsystems, alerts, searchQuery } = useStore();
  const feedRef = useRef<HTMLDivElement>(null);

  // auto-scroll alert feed to top on new alert (newest first)
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [alerts]);

  const q = searchQuery.toLowerCase();

  const filteredComms = comms.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.direction.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
  );

  const filteredAlerts = alerts.filter(
    (a) =>
      !q ||
      a.source.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q) ||
      a.severity.toLowerCase().includes(q)
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Search hint */}
      {q && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-xs text-accent-cyan font-mono"
        >
          <Search className="w-3 h-3" />
          Filtering by "{searchQuery}" — {filteredComms.length} links · {filteredAlerts.length} alerts
        </motion.div>
      )}

      {/* Comms links */}
      <motion.div variants={item}>
        <Panel title="Communication Links" icon={Radio}>
          {filteredComms.length === 0 && (
            <div className="text-xs text-slate-500 py-4 text-center">No links match "{searchQuery}"</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredComms.map((link) => {
              const Icon = link.direction === "downlink" ? ArrowDown : ArrowUp;
              return (
                <div key={link.name} className="glass-panel p-3 border border-space-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${linkStatusColor[link.status]}`} />
                      <span className="text-xs font-display font-medium text-slate-200">{link.name}</span>
                    </div>
                    <span
                      className={`status-dot ${statusDotColor(
                        link.status === "online" ? "nominal" : link.status === "degraded" ? "warning" : "critical"
                      )}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-display">Throughput</div>
                      <div className="telemetry-text text-accent-cyan">
                        {link.throughputMbps.toFixed(2)} <span className="text-slate-500">Mbps</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-display">Latency</div>
                      <div className="telemetry-text text-slate-300">
                        {link.latencyMs.toFixed(0)} <span className="text-slate-500">ms</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    {link.direction} · {link.status}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subsystem health */}
        <motion.div variants={item}>
          <Panel title="Subsystem Health" icon={Heart}>
            <div className="space-y-2.5">
              {subsystems.map((sub) => (
                <div key={sub.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-display">{sub.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="telemetry-text text-slate-400">
                        {sub.value.toFixed(0)}
                        {sub.unit}
                      </span>
                      <StatusBadge status={sub.health} />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-space-bg/60 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          sub.health === "nominal"
                            ? "linear-gradient(90deg,#22c55e,#16a34a)"
                            : sub.health === "warning"
                            ? "linear-gradient(90deg,#f59e0b,#d97706)"
                            : "linear-gradient(90deg,#ef4444,#dc2626)",
                      }}
                      animate={{ width: `${sub.value}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>

        {/* Alert log */}
        <motion.div variants={item}>
          <Panel title={`Live Alert Log${q ? ` — ${filteredAlerts.length} results` : ""}`} icon={AlertTriangle}>
            <div ref={feedRef} className="h-[420px] overflow-y-auto scrollbar-thin space-y-1.5 pr-1">
              {filteredAlerts.length === 0 && (
                <div className="text-xs text-slate-500 py-6 text-center">No alerts match "{searchQuery}"</div>
              )}
              <AnimatePresence initial={false}>
                {filteredAlerts.map((alert) => {
                  const Icon = severityIcon[alert.severity];
                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 6 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-space-bg/40 border border-space-border"
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${severityColor[alert.severity]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-display font-medium text-slate-200">{alert.source}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(alert.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{alert.message}</p>
                      </div>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          alert.severity === "critical"
                            ? "border-status-critical/30 text-status-critical bg-status-critical/10"
                            : alert.severity === "warning"
                            ? "border-status-warning/30 text-status-warning bg-status-warning/10"
                            : "border-accent-blue/30 text-accent-blue bg-accent-blue/10"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </Panel>
        </motion.div>
      </div>

      {/* System summary */}
      <motion.div variants={item}>
        <Panel title="System Integrity" icon={Activity}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryStat
              label="Online Subsystems"
              value={`${subsystems.filter((s) => s.health === "nominal").length}/${subsystems.length}`}
              color="text-status-nominal"
            />
            <SummaryStat
              label="Active Links"
              value={`${comms.filter((c) => c.status === "online").length}/${comms.length}`}
              color="text-accent-cyan"
            />
            <SummaryStat
              label="Critical Alerts"
              value={`${alerts.filter((a) => a.severity === "critical").length}`}
              color="text-status-critical"
            />
            <SummaryStat
              label="Warning Alerts"
              value={`${alerts.filter((a) => a.severity === "warning").length}`}
              color="text-status-warning"
            />
          </div>
        </Panel>
      </motion.div>

      <motion.div variants={item}>
        <CommsHealthPanel />
      </motion.div>
    </motion.div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-display">{label}</div>
      <div className={`telemetry-text text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
