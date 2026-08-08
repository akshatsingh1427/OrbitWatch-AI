import { Database, Cpu, Server, Percent, Clock } from "lucide-react";
import { useAlerts, useBackendHealth, useStatistics } from "../../hooks/useRiskData";
import { Panel, Skeleton, StatusBadge } from "../ui";

export default function ResourcesBackendPanel() {
  const statistics = useStatistics();
  const health = useBackendHealth();
  const alerts = useAlerts(1);

  const isLoading = statistics.isLoading || health.isLoading;
  const latest = alerts.data?.[0];

  return (
    <Panel title="AI Risk Engine Resources" icon={Cpu}>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric icon={Database} label="Dataset Size" value={`${statistics.data?.total_satellites ?? "—"} satellites`} />
          <Metric icon={Database} label="Predictions Stored" value={`${health.data?.predictions.toLocaleString() ?? "—"}`} />
          <Metric icon={Percent} label="Avg Risk Probability" value={statistics.data ? `${(statistics.data.average_probability * 100).toFixed(1)}%` : "—"} />
          <Metric
            icon={Server}
            label="ML Model"
            valueNode={<StatusBadge status={health.isError ? "offline" : "active"} />}
          />
          <Metric
            icon={Database}
            label="Database"
            valueNode={
              <StatusBadge status={health.isError ? "critical" : health.data?.database === "connected" ? "nominal" : "warning"} />
            }
          />
          <Metric icon={Server} label="API Status" valueNode={<StatusBadge status={health.isError ? "critical" : "nominal"} />} />
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-space-border/60">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
          <Clock className="w-3 h-3" /> Latest Prediction
        </div>
        {alerts.isLoading ? (
          <Skeleton className="h-5 w-40" />
        ) : latest ? (
          <p className="text-xs text-slate-300">
            {latest.object_name} · NORAD {latest.norad_id} ·{" "}
            {(latest.risk_probability * 100).toFixed(1)}% risk
            {latest.prediction_time && (
              <span className="text-slate-500 font-mono"> · {new Date(latest.prediction_time).toLocaleString()}</span>
            )}
          </p>
        ) : (
          <p className="text-xs text-slate-500">No recent high-risk predictions.</p>
        )}
      </div>
    </Panel>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  valueNode,
}: {
  icon: typeof Database;
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-space-border bg-space-bg/50 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3 text-slate-500" />
        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">{label}</span>
      </div>
      {valueNode ?? <span className="text-sm font-semibold text-slate-200">{value}</span>}
    </div>
  );
}
