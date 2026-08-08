import { motion } from "framer-motion";
import { Server, Database, Cpu, Timer, Radio, Wifi, WifiOff } from "lucide-react";
import { useHealthMonitor } from "../../hooks/useHealthMonitor";
import { Panel, Skeleton, StatusBadge } from "../ui";

export default function CommsHealthPanel() {
  const { data, isLoading, isError, latencyMs, lastSuccessAt, online } = useHealthMonitor();

  return (
    <Panel title="Backend Connection" icon={Radio}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {online ? (
            <Wifi className="w-4 h-4 text-status-nominal" />
          ) : (
            <WifiOff className="w-4 h-4 text-status-critical" />
          )}
          <span className={`text-sm font-semibold ${online ? "text-status-nominal" : "text-status-critical"}`}>
            {online ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
        {latencyMs !== null && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <Timer className="w-3 h-3" /> {latencyMs} ms
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Row icon={Server} label="API Status" node={<StatusBadge status={isError ? "critical" : "nominal"} />} />
          <Row
            icon={Database}
            label="Database Status"
            node={
              <StatusBadge status={isError ? "critical" : data?.database === "connected" ? "nominal" : "warning"} />
            }
          />
          <Row icon={Cpu} label="Prediction Engine" node={<StatusBadge status={isError ? "offline" : "active"} />} />
          <Row
            icon={Database}
            label="Prediction Count"
            node={<span className="text-xs font-mono text-slate-300">{data?.predictions.toLocaleString() ?? "—"}</span>}
          />
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-space-border/60 text-[10px] font-mono text-slate-500">
        Last successful request:{" "}
        <span className="text-slate-300">
          {lastSuccessAt ? lastSuccessAt.toLocaleTimeString() : "—"}
        </span>
      </div>
    </Panel>
  );
}

function Row({ icon: Icon, label, node }: { icon: typeof Server; label: string; node: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <Icon className="w-3.5 h-3.5 text-slate-500" /> {label}
      </span>
      {node}
    </div>
  );
}
