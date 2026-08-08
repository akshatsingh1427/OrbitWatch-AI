export function riskTier(probability: number): "low" | "medium" | "high" {
  if (probability >= 0.7) return "high";
  if (probability >= 0.4) return "medium";
  return "low";
}

const TIER_STYLES: Record<string, string> = {
  low: "bg-status-nominal/15 text-status-nominal border-status-nominal/30",
  medium: "bg-status-warning/15 text-status-warning border-status-warning/30",
  high: "bg-status-critical/15 text-status-critical border-status-critical/30",
};

const TIER_LABEL: Record<string, string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

export function RiskBadge({ probability }: { probability: number }) {
  const tier = riskTier(probability);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${TIER_STYLES[tier]}`}
    >
      <span
        className={`status-dot ${
          tier === "high" ? "bg-status-critical animate-pulse" : tier === "medium" ? "bg-status-warning" : "bg-status-nominal"
        }`}
      />
      {TIER_LABEL[tier]}
    </span>
  );
}

export function ProbabilityBar({ probability }: { probability: number }) {
  const tier = riskTier(probability);
  const barColor =
    tier === "high" ? "bg-status-critical" : tier === "medium" ? "bg-status-warning" : "bg-status-nominal";
  const pct = Math.min(100, Math.max(0, probability * 100));
  return (
    <div className="flex items-center gap-2 w-full min-w-[96px]">
      <div className="flex-1 h-1.5 rounded-full bg-space-hover/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-mono text-slate-400 w-10 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
}
