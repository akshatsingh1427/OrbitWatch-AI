import { motion } from "framer-motion";
import { BrainCircuit, Orbit, ShieldAlert, ShieldCheck, Percent } from "lucide-react";
import type { StatisticsResponse } from "../../api/riskApi";
import { Skeleton } from "../ui";

interface Props {
  statistics?: StatisticsResponse;
  isLoading: boolean;
  isError: boolean;
}

export default function RiskHero({ statistics, isLoading, isError }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-space-border">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 via-space-panel to-accent-cyan/10" />
      <div className="absolute inset-0 animate-pulse-slow bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(34,211,238,0.2),transparent_45%)]" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-space-bg/40 backdrop-blur-[2px]" />

      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 text-[11px] font-mono tracking-[0.25em] text-accent-cyan uppercase mb-3"
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          Machine Learning · Space Situational Awareness
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-2xl sm:text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-accent-cyan bg-clip-text text-transparent"
        >
          AI Collision Risk Prediction
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 text-sm text-slate-400 max-w-xl"
        >
          Real-time orbital risk inference across the tracked catalog, powered by the OrbitWatch
          prediction engine.
        </motion.p>

        <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Orbit}
            label="Total Satellites"
            value={statistics?.total_satellites}
            isLoading={isLoading}
            isError={isError}
            accent="text-accent-cyan"
            delay={0.05}
          />
          <StatCard
            icon={ShieldAlert}
            label="High Risk"
            value={statistics?.high_risk}
            isLoading={isLoading}
            isError={isError}
            accent="text-status-critical"
            glow
            delay={0.1}
          />
          <StatCard
            icon={ShieldCheck}
            label="Low Risk"
            value={statistics?.low_risk}
            isLoading={isLoading}
            isError={isError}
            accent="text-status-nominal"
            delay={0.15}
          />
          <StatCard
            icon={Percent}
            label="Average Probability"
            value={
              statistics ? `${(statistics.average_probability * 100).toFixed(1)}%` : undefined
            }
            isLoading={isLoading}
            isError={isError}
            accent="text-accent-blue"
            delay={0.2}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
  isError,
  accent,
  glow,
  delay = 0,
}: {
  icon: typeof Orbit;
  label: string;
  value?: string | number;
  isLoading: boolean;
  isError: boolean;
  accent: string;
  glow?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={`glass-panel glass-panel-hover p-4 relative overflow-hidden ${
        glow ? "shadow-[0_0_30px_-8px_rgba(239,68,68,0.35)]" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-4 h-4 ${accent}`} />
        {glow && (statistics_dot())}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="h-7 w-16" />
      ) : isError ? (
        <span className="text-sm text-status-critical font-mono">—</span>
      ) : (
        <h2 className={`text-2xl font-bold text-white telemetry-text ${accent}`}>{value ?? "—"}</h2>
      )}
    </motion.div>
  );
}

function statistics_dot() {
  return <span className="status-dot bg-status-critical animate-pulse" />;
}
