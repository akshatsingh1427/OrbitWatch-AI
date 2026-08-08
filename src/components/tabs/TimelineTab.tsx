import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Orbit, CheckCircle2, Cog, Package, Download, Flag, CheckCircle, Clock, Circle } from "lucide-react";
import { TIMELINE_STAGES } from "../../lib/mockData";
import { Panel } from "../ui";
import BackendEventTimeline from "../risk/BackendEventTimeline";

const stageIcons = [Rocket, Orbit, CheckCircle2, Cog, Package, Download, Flag];

const statusConfig = {
  completed: { color: "text-status-nominal", bg: "bg-status-nominal", ring: "border-status-nominal", Icon: CheckCircle },
  active: { color: "text-accent-blue", bg: "bg-accent-blue", ring: "border-accent-blue", Icon: Clock },
  upcoming: { color: "text-slate-500", bg: "bg-slate-600", ring: "border-slate-600", Icon: Circle },
};

export default function TimelineTab() {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // animate the progress line filling on mount
  useEffect(() => {
    const completedCount = TIMELINE_STAGES.filter((s) => s.status === "completed").length;
    const activeIndex = TIMELINE_STAGES.findIndex((s) => s.status === "active");
    const targetPct = activeIndex >= 0 ? (activeIndex / (TIMELINE_STAGES.length - 1)) * 100 : (completedCount / TIMELINE_STAGES.length) * 100;
    const id = requestAnimationFrame(() => setProgress(targetPct));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <Panel title="Mission Timeline" icon={Rocket}>
        <div ref={ref} className="relative py-8 px-2 overflow-x-auto scrollbar-thin">
          {/* track */}
          <div className="relative min-w-[640px]">
            <div className="absolute top-7 left-0 right-0 h-0.5 bg-space-border rounded-full" />
            <motion.div
              className="absolute top-7 left-0 h-0.5 rounded-full bg-gradient-to-r from-status-nominal via-accent-blue to-accent-cyan"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* stage nodes */}
            <div className="relative flex justify-between">
              {TIMELINE_STAGES.map((stage, i) => {
                const cfg = statusConfig[stage.status];
                const Icon = stageIcons[i] ?? Circle;
                const StageIcon = cfg.Icon;
                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center w-32 text-center"
                  >
                    <div
                      className={`relative z-10 w-14 h-14 rounded-full border-2 ${cfg.ring} bg-space-bg flex items-center justify-center mb-3 ${
                        stage.status === "active" ? "glow-blue" : ""
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                      {stage.status === "active" && (
                        <span className="absolute inset-0 rounded-full border-2 border-accent-blue animate-ping opacity-40" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-200">{stage.name}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">{stage.timestamp}</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <StageIcon className={`w-3 h-3 ${cfg.color}`} />
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${cfg.color}`}>{stage.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed max-w-[120px]">{stage.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      {/* Stage detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TIMELINE_STAGES.map((stage, i) => {
          const cfg = statusConfig[stage.status];
          const Icon = stageIcons[i] ?? Circle;
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
              className="glass-panel glass-panel-hover p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className="text-sm font-semibold text-slate-200">{stage.name}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mb-2">{stage.timestamp}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{stage.description}</p>
            </motion.div>
          );
        })}
      </div>

      <BackendEventTimeline />
    </motion.div>
  );
}
