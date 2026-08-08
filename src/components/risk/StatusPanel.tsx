import { Server, Database, Cpu } from "lucide-react";
import type { HealthResponse } from "../../api/riskApi";
import { StatusBadge } from "../ui";

interface Props {
  health?: HealthResponse;
  isLoading: boolean;
  isError: boolean;
}

export default function StatusPanel({ health, isLoading, isError }: Props) {
  const backendStatus = isError ? "critical" : isLoading ? "standby" : "nominal";
  const dbStatus = isError ? "critical" : isLoading ? "standby" : health?.database === "connected" ? "nominal" : "warning";
  const pipelineStatus = isError ? "offline" : isLoading ? "standby" : "active";

  return (
    <div className="glass-panel glass-panel-hover relative overflow-hidden p-4">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />

      <div className="flex items-center gap-2 mb-3.5">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
          <Server className="w-3.5 h-3.5 text-accent-blue" />
        </span>
        <h3 className="text-xs font-semibold tracking-widest text-slate-300 uppercase">
          System Status
        </h3>
      </div>
      <div className="space-y-2.5">
        <Row icon={Server} label="Backend Status" status={backendStatus} />
        <Row icon={Database} label="Database Status" status={dbStatus} />
        <Row icon={Cpu} label="Prediction Pipeline" status={pipelineStatus} />
      </div>
      {!isLoading && !isError && health && (
        <p className="mt-3.5 pt-3 border-t border-space-border/40 text-[10px] font-mono text-slate-500">
          {health.predictions.toLocaleString()} predictions in store
        </p>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  status,
}: {
  icon: typeof Server;
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-300">{label}</span>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}
