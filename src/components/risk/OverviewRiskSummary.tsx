import { motion } from "framer-motion";
import { Orbit, ShieldAlert, ShieldCheck, Percent, Server, Database, Cpu, Bell } from "lucide-react";
import { useAlerts, useBackendHealth, useStatistics, useTopRisk } from "../../hooks/useRiskData";
import { Panel, Skeleton, StatusBadge } from "../ui";
import { ProbabilityBar, RiskBadge } from "./RiskVisuals";

export default function OverviewRiskSummary({ delay = 0 }: { delay?: number }) {
  const statistics = useStatistics();
  const health = useBackendHealth();
  const topRisk = useTopRisk(5);
  const alerts = useAlerts(5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Statistics + system status row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={Orbit} label="Total Satellites" value={statistics.data?.total_satellites} loading={statistics.isLoading} error={statistics.isError} accent="text-accent-cyan" />
        <Stat icon={ShieldAlert} label="High Risk" value={statistics.data?.high_risk} loading={statistics.isLoading} error={statistics.isError} accent="text-status-critical" />
        <Stat icon={ShieldCheck} label="Low Risk" value={statistics.data?.low_risk} loading={statistics.isLoading} error={statistics.isError} accent="text-status-nominal" />
        <Stat
          icon={Percent}
          label="Avg Probability"
          value={statistics.data ? `${(statistics.data.average_probability * 100).toFixed(1)}%` : undefined}
          loading={statistics.isLoading}
          error={statistics.isError}
          accent="text-accent-blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Backend" icon={Server}>
          <div className="space-y-2.5">
            <Row label="Backend Status" node={<StatusBadge status={health.isError ? "critical" : health.isLoading ? "standby" : "nominal"} />} />
            <Row
              label="Database Status"
              node={
                <StatusBadge
                  status={health.isError ? "critical" : health.data?.database === "connected" ? "nominal" : "warning"}
                />
              }
            />
            <Row
              label="Prediction Count"
              node={
                health.isLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span className="text-xs font-mono text-slate-300">
                    {health.data?.predictions.toLocaleString() ?? "—"}
                  </span>
                )
              }
            />
          </div>
        </Panel>

        <Panel title="Top-Risk Objects" icon={Cpu}>
          {topRisk.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : topRisk.isError || !topRisk.data?.length ? (
            <p className="text-xs text-slate-500 py-2">No risk data available.</p>
          ) : (
            <div className="space-y-1.5">
              {topRisk.data.map((s) => (
                <div key={s.norad_id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-300 truncate">{s.object_name}</span>
                  <RiskBadge probability={s.risk_probability} />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Recent Alerts" icon={Bell}>
          {alerts.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : alerts.isError || !alerts.data?.length ? (
            <p className="text-xs text-slate-500 py-2">No active alerts.</p>
          ) : (
            <div className="space-y-2">
              {alerts.data.map((a, i) => (
                <div key={`${a.norad_id}-${i}`} className="text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-200 truncate">{a.object_name}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {(a.risk_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <ProbabilityBar probability={a.risk_probability} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </motion.div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  loading,
  error,
  accent,
}: {
  icon: typeof Orbit;
  label: string;
  value?: string | number;
  loading: boolean;
  error: boolean;
  accent: string;
}) {
  return (
    <div className="glass-panel glass-panel-hover p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 tracking-widest uppercase font-display">{label}</span>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : error ? (
        <span className="text-sm text-status-critical font-mono">—</span>
      ) : (
        <div className={`telemetry-text text-2xl font-bold text-white`}>{value ?? "—"}</div>
      )}
    </div>
  );
}

function Row({ label, node }: { label: string; node: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400 flex items-center gap-1.5">
        <Database className="w-3 h-3 text-slate-500" /> {label}
      </span>
      {node}
    </div>
  );
}
