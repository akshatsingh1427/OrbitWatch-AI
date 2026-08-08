import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Satellite as SatelliteIcon, Database } from "lucide-react";
import { useTopRisk, useSatellite } from "../../hooks/useRiskData";
import { Panel, Skeleton } from "../ui";
import { ProbabilityBar, RiskBadge } from "./RiskVisuals";

export default function TelemetryBackendPanel() {
  const topRisk = useTopRisk(20);
  const [noradId, setNoradId] = useState<number | null>(null);

  // Default to the highest-risk object once the list loads
  useEffect(() => {
    if (noradId === null && topRisk.data && topRisk.data.length > 0) {
      setNoradId(topRisk.data[0].norad_id);
    }
  }, [topRisk.data, noradId]);

  const detail = useSatellite(noradId);

  return (
    <Panel title="Live Backend Orbital / ML Data" icon={Database}>
      <p className="text-[10px] text-slate-500 mb-3 flex items-center gap-1.5">
        <span className="status-dot bg-accent-cyan" />
        Sourced from <code className="font-mono text-accent-cyan">GET /risk/&#123;norad_id&#125;</code> — distinct
        from the simulated legacy telemetry above.
      </p>

      <div className="flex items-center gap-2 mb-3">
        <SatelliteIcon className="w-3.5 h-3.5 text-slate-500" />
        {topRisk.isLoading ? (
          <Skeleton className="h-7 w-40" />
        ) : (
          <select
            value={noradId ?? ""}
            onChange={(e) => setNoradId(Number(e.target.value))}
            className="bg-space-bg/60 border border-space-border rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-accent-blue/50"
          >
            {(topRisk.data ?? []).map((s) => (
              <option key={s.norad_id} value={s.norad_id}>
                {s.object_name} · {s.norad_id}
              </option>
            ))}
          </select>
        )}
      </div>

      {detail.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : detail.isError || !detail.data ? (
        <p className="text-xs text-status-critical py-3">Failed to load satellite detail.</p>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <RiskBadge probability={detail.data.risk_probability} />
            <span className="text-xs font-mono text-slate-400">
              {(detail.data.risk_probability * 100).toFixed(1)}% AI risk probability
            </span>
          </div>
          <ProbabilityBar probability={detail.data.risk_probability} />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 font-mono">
            <Field label="NORAD ID" value={String(detail.data.norad_id)} />
            <Field label="Altitude" value={fmt(detail.data.altitude_km, "km")} />
            <Field label="Inclination" value={fmt(detail.data.inclination, "°")} />
            <Field label="RAAN" value={fmt(detail.data.raan, "°")} />
            <Field label="Eccentricity" value={fmt(detail.data.eccentricity)} />
            <Field label="Mean Motion" value={fmt(detail.data.mean_motion, "rev/day")} />
            <Field label="BSTAR" value={fmt(detail.data.bstar)} />
            <Field label="Risk Label" value={detail.data.risk_label === 1 ? "HIGH" : "LOW"} />
          </div>
        </>
      )}
    </Panel>
  );
}

function fmt(value: number | null | undefined, unit = "") {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(4)}${unit ? ` ${unit}` : ""}`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-space-border bg-space-bg/50 px-2.5 py-1.5">
      <p className="text-[9px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-xs text-slate-200 mt-0.5">{value}</p>
    </div>
  );
}
