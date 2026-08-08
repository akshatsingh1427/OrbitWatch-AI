import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart as PieChartIcon, TrendingUp, BarChart3 } from "lucide-react";
import type { RiskSummary, StatisticsResponse } from "../../api/riskApi";
import { Skeleton } from "../ui";

interface Props {
  statistics?: StatisticsResponse;
  satellites: RiskSummary[];
  isLoading: boolean;
}

const COLORS = { low: "#22c55e", high: "#ef4444" };
const tooltipStyle = {
  background: "#0d1320",
  border: "1px solid #1a2436",
  borderRadius: 8,
  fontSize: 11,
  fontFamily: "IBM Plex Mono, monospace",
};

export default function RiskCharts({ statistics, satellites, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const pieData = statistics
    ? [
        { name: "Low Risk", value: statistics.low_risk, key: "low" },
        { name: "High Risk", value: statistics.high_risk, key: "high" },
      ]
    : [];

  const barData = [...satellites]
    .sort((a, b) => b.risk_probability - a.risk_probability)
    .slice(0, 8)
    .map((s) => ({
      name: s.object_name.length > 12 ? `${s.object_name.slice(0, 12)}…` : s.object_name,
      probability: Number((s.risk_probability * 100).toFixed(1)),
    }));

  const lineData = [...satellites]
    .sort((a, b) => b.risk_probability - a.risk_probability)
    .map((s, i) => ({
      rank: i + 1,
      probability: Number((s.risk_probability * 100).toFixed(1)),
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ChartCard title="Risk Distribution" icon={PieChartIcon} accent="cyan">
        {pieData.length === 0 || pieData.every((d) => d.value === 0) ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.key} fill={COLORS[entry.key as "low" | "high"]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Top Risk Satellites" icon={BarChart3} accent="blue">
        {barData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "IBM Plex Mono, monospace" }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} width={30} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(59,130,246,0.08)" }} />
              <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                {barData.map((d, i) => (
                  <Cell key={i} fill={d.probability >= 70 ? "#ef4444" : d.probability >= 40 ? "#f59e0b" : "#22c55e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Probability by Risk Rank" icon={TrendingUp} accent="cyan">
        {lineData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" vertical={false} />
              <XAxis dataKey="rank" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="probability"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: typeof PieChartIcon;
  accent: "cyan" | "blue";
  children: React.ReactNode;
}) {
  const chipClass =
    accent === "cyan"
      ? "bg-accent-cyan/10 border-accent-cyan/20"
      : "bg-accent-blue/10 border-accent-blue/20";
  const iconClass = accent === "cyan" ? "text-accent-cyan" : "text-accent-blue";
  const topBorderGradient =
    accent === "cyan"
      ? "linear-gradient(to right, transparent, rgba(34,211,238,0.5), transparent)"
      : "linear-gradient(to right, transparent, rgba(59,130,246,0.5), transparent)";

  return (
    <div className="glass-panel glass-panel-hover relative overflow-hidden p-4">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundImage: topBorderGradient }} />
      <div className="flex items-center gap-2 mb-2">
        <span className={`flex items-center justify-center w-6 h-6 rounded-md border ${chipClass}`}>
          <Icon className={`w-3 h-3 ${iconClass}`} />
        </span>
        <h3 className="text-xs font-semibold tracking-widest text-slate-300 uppercase">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[220px] flex items-center justify-center text-xs text-slate-500">
      No data available
    </div>
  );
}
