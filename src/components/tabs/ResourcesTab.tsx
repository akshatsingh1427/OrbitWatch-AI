import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell,
} from "recharts";
import { Fuel, Zap, Database, CalendarClock, BatteryCharging } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Panel } from "../ui";
import ResourcesBackendPanel from "../risk/ResourcesBackendPanel";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const chartProps = {
  tick: { fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono" },
  axisLine: { stroke: "#1a2436" },
  tickLine: false as const,
};

const barColors = ["#3b82f6", "#22d3ee", "#22c55e", "#f59e0b"];

function CustomTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-2.5 py-1.5 text-xs">
      <div className="text-slate-500 font-mono mb-0.5">{label}</div>
      <div className="text-accent-cyan font-mono">{payload[0].value.toFixed(2)} <span className="text-slate-500">{unit}</span></div>
    </div>
  );
}

export default function ResourcesTab() {
  const { resources } = useStore();

  const fuelData = useMemo(() => [{ name: "Fuel", value: resources.fuelPct, fill: "#3b82f6" }], [resources.fuelPct]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Top counter row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CounterCard icon={Fuel} label="Fuel Remaining" value={`${resources.fuelPct.toFixed(1)}%`} sub={`${resources.fuelKg.toLocaleString()} kg`} color="#3b82f6" />
        <CounterCard icon={Zap} label="Power Generated" value={`${resources.powerGeneratedKw.toFixed(1)} kW`} sub="4 sources active" color="#22c55e" />
        <CounterCard icon={Database} label="Data Usage" value={`${resources.dataUsageGb.toFixed(1)} GB`} sub="last 24h" color="#22d3ee" />
        <CounterCard icon={CalendarClock} label="Events (24h)" value={`${resources.events24h}`} sub="auto-incrementing" color="#f59e0b" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fuel radial gauge */}
        <motion.div variants={item}>
          <Panel title="Fuel Level" icon={Fuel}>
            <div className="h-56 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={fuelData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: "#1a2436" }} dataKey="value" cornerRadius={10} fill="#3b82f6" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="telemetry-text text-4xl font-bold text-white">{resources.fuelPct.toFixed(0)}<span className="text-lg text-slate-500">%</span></div>
                <div className="text-xs text-slate-500 font-mono mt-1">{resources.fuelKg.toLocaleString()} kg</div>
              </div>
            </div>
          </Panel>
        </motion.div>

        {/* Power generation bar chart */}
        <motion.div variants={item}>
          <Panel title="Power Generation" icon={Zap}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resources.powerBySource} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1a2436" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="source" {...chartProps} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis {...chartProps} />
                  <Tooltip content={<CustomTooltip unit="kW" />} cursor={{ fill: "#16213a40" }} />
                  <Bar dataKey="kw" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={500}>
                    {resources.powerBySource.map((_, i) => (
                      <Cell key={i} fill={barColors[i % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </motion.div>
      </div>

      {/* Data usage area chart */}
      <motion.div variants={item}>
        <Panel title="Data Usage — Last 24h" icon={Database}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resources.dataByHour} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradData" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a2436" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" {...chartProps} interval={3} />
                <YAxis {...chartProps} />
                <Tooltip content={<CustomTooltip unit="GB" />} />
                <Area type="monotone" dataKey="gb" stroke="#22d3ee" strokeWidth={2} fill="url(#gradData)" isAnimationActive animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </motion.div>

      {/* Resource summary */}
      <motion.div variants={item}>
        <Panel title="Resource Summary" icon={BatteryCharging}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryItem label="Solar Efficiency" value="92.4%" color="text-status-nominal" />
            <SummaryItem label="Battery Charge" value="78%" color="text-accent-cyan" />
            <SummaryItem label="Data Buffer" value="64.2 / 128 GB" color="text-accent-blue" />
            <SummaryItem label="Consumable O2" value="88%" color="text-status-nominal" />
          </div>
        </Panel>
      </motion.div>

      <motion.div variants={item}>
        <ResourcesBackendPanel />
      </motion.div>
    </motion.div>
  );
}

function CounterCard({ icon: Icon, label, value, sub, color }: { icon: typeof Fuel; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="glass-panel glass-panel-hover p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs text-slate-400 tracking-widest uppercase">{label}</span>
      </div>
      <div className="telemetry-text text-2xl font-bold text-white">{value}</div>
      <div className="text-[10px] text-slate-500 font-mono mt-1">{sub}</div>
    </div>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`telemetry-text text-lg font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
