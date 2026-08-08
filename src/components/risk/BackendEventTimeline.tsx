import { motion } from "framer-motion";
import { Bell, Radio, Sparkles } from "lucide-react";
import { useAlerts, useBackendHealth } from "../../hooks/useRiskData";
import { Panel, Skeleton } from "../ui";

interface EventItem {
  key: string;
  icon: typeof Bell;
  color: string;
  title: string;
  detail: string;
  time: string | null;
}

export default function BackendEventTimeline() {
  const alerts = useAlerts(10);
  const health = useBackendHealth();

  const isLoading = alerts.isLoading || health.isLoading;

  const events: EventItem[] = [];

  if (health.isSuccess) {
    events.push({
      key: "backend-connected",
      icon: Radio,
      color: "text-accent-cyan",
      title: "Backend Connected",
      detail: `${health.data.predictions.toLocaleString()} predictions in store`,
      time: health.dataUpdatedAt ? new Date(health.dataUpdatedAt).toLocaleTimeString() : null,
    });
  }

  (alerts.data ?? []).forEach((a, i) => {
    events.push({
      key: `alert-${a.norad_id}-${i}`,
      icon: Bell,
      color: "text-status-critical",
      title: "Prediction Generated · Risk Alert Detected",
      detail: `${a.object_name} · NORAD ${a.norad_id} · ${(a.risk_probability * 100).toFixed(1)}%`,
      time: a.prediction_time ? new Date(a.prediction_time).toLocaleString() : null,
    });
  });

  return (
    <Panel title="Backend Event Log" icon={Sparkles}>
      <p className="text-[10px] text-slate-500 mb-3">
        Built only from real responses (<code className="font-mono text-accent-cyan">/health</code>,{" "}
        <code className="font-mono text-accent-cyan">/alerts</code>) — no simulated history.
      </p>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">No backend events available yet.</p>
      ) : (
        <div className="space-y-2">
          {events.map((e, i) => {
            const Icon = e.icon;
            return (
              <motion.div
                key={e.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                className="flex items-start gap-2.5 rounded-lg border border-space-border bg-space-bg/50 px-3 py-2"
              >
                <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${e.color}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-200 truncate">{e.title}</span>
                    {e.time && <span className="text-[10px] font-mono text-slate-500 shrink-0">{e.time}</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{e.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
