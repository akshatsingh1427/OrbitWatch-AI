import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface PanelProps {
  title?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Panel({ title, icon: Icon, action, children, className = "", delay = 0 }: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel glass-panel-hover p-4 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-accent-cyan" />}
            {title && <h3 className="text-xs font-semibold tracking-widest text-slate-300 uppercase">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-space-hover/50 ${className}`} />;
}

const statusColors: Record<string, string> = {
  nominal: "bg-status-nominal/15 text-status-nominal border-status-nominal/30",
  active: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
  warning: "bg-status-warning/15 text-status-warning border-status-warning/30",
  critical: "bg-status-critical/15 text-status-critical border-status-critical/30",
  completed: "bg-slate-600/15 text-slate-400 border-slate-600/30",
  offline: "bg-slate-600/15 text-slate-500 border-slate-600/30",
  info: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
  standby: "bg-slate-600/15 text-slate-400 border-slate-600/30",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] ?? statusColors.nominal;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${cls}`}>
      <span className={`status-dot ${statusDotColor(status)}`} />
      {status.toUpperCase()}
    </span>
  );
}

export function statusDotColor(status: string): string {
  switch (status) {
    case "nominal":
      return "bg-status-nominal";
    case "active":
      return "bg-accent-blue animate-pulse";
    case "warning":
      return "bg-status-warning";
    case "critical":
      return "bg-status-critical animate-pulse";
    case "completed":
      return "bg-slate-500";
    case "offline":
      return "bg-slate-600";
    default:
      return "bg-slate-500";
  }
}
