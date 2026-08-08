import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, Satellite, Zap, Signal, MapPin, Radio, Download } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Panel } from "../ui";
import GroundTrack from "../GroundTrack";
import TelemetryBackendPanel from "../risk/TelemetryBackendPanel";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const chartProps = {
  stroke: "#1a2436",
  tick: { fill: "#64748b", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" },
  axisLine: { stroke: "#1a2436" },
  tickLine: false as const,
};

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-2.5 py-1.5 text-xs">
      <div className="text-slate-500 font-mono mb-0.5">{label}</div>
      <div className="text-accent-cyan font-mono">
        {payload[0].value.toFixed(2)} <span className="text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function exportCSV(data: ReturnType<typeof buildChartData>) {
  const headers = ["time", "altitude_km", "velocity_kms", "signal_dbm", "power_pct", "temp_c", "latitude", "longitude"];
  const rows = data.map((d) =>
    [d.time, d.altitude.toFixed(3), d.velocity.toFixed(4), d.signal.toFixed(2), d.power.toFixed(1), d.temp.toFixed(2), d.lat.toFixed(4), d.lon.toFixed(4)].join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orbitwatch-telemetry-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function buildChartData(telemetry: ReturnType<typeof useStore.getState>["telemetry"]) {
  return telemetry.map((p) => ({
    time: new Date(p.t).toLocaleTimeString("en-US", { hour12: false }).slice(0, 8),
    altitude: p.altitudeKm,
    velocity: p.velocityKms,
    signal: p.signalDbm,
    power: p.powerPct,
    temp: p.tempC,
    lat: p.latitude,
    lon: p.longitude,
  }));
}

export default function TelemetryTab() {
  const { telemetry } = useStore();

  const data = useMemo(() => buildChartData(telemetry), [telemetry]);
  const latest = telemetry[telemetry.length - 1];

  const handleExport = useCallback(() => exportCSV(data), [data]);

  const csvAction = (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/10 transition-colors"
      title="Export telemetry as CSV"
    >
      <Download className="w-3 h-3" />
      CSV
    </button>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Readout icon={Satellite} label="Altitude" value={latest.altitudeKm.toFixed(2)} unit="km" color="#3b82f6" />
        <Readout icon={Zap} label="Velocity" value={latest.velocityKms.toFixed(3)} unit="km/s" color="#22d3ee" />
        <Readout icon={Signal} label="Signal" value={latest.signalDbm.toFixed(1)} unit="dBm" color="#22c55e" />
        <Readout icon={Activity} label="Core Temp" value={latest.tempC.toFixed(1)} unit="°C" color="#f59e0b" />
      </motion.div>

      <motion.div variants={item}>
        <Panel title="Altitude Profile" icon={Satellite} action={csvAction}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAlt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a2436" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" {...chartProps} interval="preserveStartEnd" minTickGap={40} />
                <YAxis {...chartProps} domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip content={<CustomTooltip unit="km" />} />
                <Area type="monotone" dataKey="altitude" stroke="#3b82f6" strokeWidth={2} fill="url(#gradAlt)" isAnimationActive animationDuration={400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Panel title="Velocity" icon={Zap}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1a2436" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" {...chartProps} interval="preserveStartEnd" minTickGap={40} />
                  <YAxis {...chartProps} domain={["dataMin - 0.05", "dataMax + 0.05"]} />
                  <Tooltip content={<CustomTooltip unit="km/s" />} />
                  <Line type="monotone" dataKey="velocity" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive animationDuration={400} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </motion.div>

        <motion.div variants={item}>
          <Panel title="Signal Strength" icon={Signal}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1a2436" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" {...chartProps} interval="preserveStartEnd" minTickGap={40} />
                  <YAxis {...chartProps} domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip content={<CustomTooltip unit="dBm" />} />
                  <Line type="monotone" dataKey="signal" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive animationDuration={400} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={item}>
          <Panel title="Power Level" icon={Activity}>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPwr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a2436" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" {...chartProps} interval="preserveStartEnd" minTickGap={40} />
                  <YAxis {...chartProps} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip unit="%" />} />
                  <Area type="monotone" dataKey="power" stroke="#22c55e" strokeWidth={2} fill="url(#gradPwr)" isAnimationActive animationDuration={400} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <Panel title="Live Telemetry Feed" icon={Radio}>
            <div className="h-40 overflow-y-auto scrollbar-thin font-mono text-xs space-y-1 pr-2">
              {[...telemetry].reverse().slice(0, 20).map((p) => (
                <motion.div
                  key={p.t}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-slate-400"
                >
                  <span className="text-slate-600">{new Date(p.t).toLocaleTimeString("en-US", { hour12: false })}</span>
                  <span className="text-accent-blue">ALT {p.altitudeKm.toFixed(2)}</span>
                  <span className="text-accent-cyan">VEL {p.velocityKms.toFixed(3)}</span>
                  <span className="text-status-nominal">PWR {p.powerPct.toFixed(0)}%</span>
                  <span className="text-status-warning">SIG {p.signalDbm.toFixed(0)}</span>
                </motion.div>
              ))}
            </div>
          </Panel>
        </motion.div>
      </div>

      {/* Ground Track */}
      <motion.div variants={item}>
        <Panel title="Ground Track" icon={MapPin}>
          <GroundTrack height={160} />
          <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-slate-500">
            <span>LAT <span className="text-accent-cyan">{latest.latitude.toFixed(4)}°</span></span>
            <span>LON <span className="text-accent-cyan">{latest.longitude.toFixed(4)}°</span></span>
            <span>HDG <span className="text-accent-cyan">{((latest.longitude % 360 + 360) % 360).toFixed(1)}°</span></span>
            <span className="ml-auto">GND TRACK <span className="text-accent-cyan">{(latest.velocityKms * 60).toFixed(1)} km/min</span></span>
          </div>
        </Panel>
      </motion.div>

      <motion.div variants={item}>
        <Panel title="Position Readout" icon={MapPin}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <PositionReadout label="Latitude" value={latest.latitude.toFixed(4)} unit="°" />
            <PositionReadout label="Longitude" value={latest.longitude.toFixed(4)} unit="°" />
            <PositionReadout label="Heading" value={`${((latest.longitude % 360 + 360) % 360).toFixed(1)}`} unit="°" />
            <PositionReadout label="Ground Track" value={`${(latest.velocityKms * 60).toFixed(1)}`} unit="km/min" />
          </div>
        </Panel>
      </motion.div>

      <motion.div variants={item}>
        <TelemetryBackendPanel />
      </motion.div>
    </motion.div>
  );
}

function Readout({ icon: Icon, label, value, unit, color }: { icon: typeof Activity; label: string; value: string; unit: string; color: string }) {
  return (
    <div className="glass-panel glass-panel-hover p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs text-slate-400 tracking-widest uppercase font-display">{label}</span>
      </div>
      <div className="telemetry-text">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-xs text-slate-500 ml-1">{unit}</span>
      </div>
    </div>
  );
}

function PositionReadout({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-display">{label}</div>
      <div className="text-lg text-accent-cyan mt-0.5">
        {value} <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  );
}
