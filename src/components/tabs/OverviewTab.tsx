import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, Radio, Rocket, Zap, Gauge, Thermometer, Satellite, MapPin } from "lucide-react";
import { useStore, SATELLITES } from "../../store/useStore";
import { getMissionStatusCounts, generateSparkline, MISSIONS } from "../../lib/mockData";
import Scene3D from "../Scene3D";
import Sparkline from "../Sparkline";
import GroundTrack from "../GroundTrack";
import { Panel, StatusBadge, statusDotColor } from "../ui";
import ErrorBoundary from "../ErrorBoundary";
import OverviewRiskSummary from "../risk/OverviewRiskSummary";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

// Map mission id → satellite id for roster clicks
const MISSION_TO_SAT: Record<string, string> = {
  "orb-001": "sat-1",
  "orb-002": "sat-2",
  "orb-003": "sat-3",
};

export default function OverviewTab() {
  const { telemetry, selectedMission, selectedSatelliteId, setSelectedMissionId, setSelectedSatelliteId, searchQuery } = useStore();
  const counts = getMissionStatusCounts();
  const latest = telemetry[telemetry.length - 1];
  const selectedSat = SATELLITES.find((s) => s.id === selectedSatelliteId);
  const mission = selectedMission();

  const q = searchQuery.toLowerCase();

  const filteredMissions = MISSIONS.filter(
    (m) =>
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.callsign.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q) ||
      m.agency.toLowerCase().includes(q)
  );

  const statusCards = [
    { label: "Active", value: counts.active, icon: Rocket, color: "text-accent-blue", border: "border-accent-blue/30" },
    { label: "Nominal", value: counts.nominal, icon: CheckCircle2, color: "text-status-nominal", border: "border-status-nominal/30" },
    { label: "Warning", value: counts.warning, icon: AlertTriangle, color: "text-status-warning", border: "border-status-warning/30" },
    { label: "Completed", value: counts.completed, icon: CheckCircle2, color: "text-slate-400", border: "border-slate-600/30" },
  ];

  const kpis = [
    { label: "Altitude", value: latest.altitudeKm.toFixed(1), unit: "km", icon: Satellite, spark: generateSparkline(20, 408, 0.01), color: "#3b82f6" },
    { label: "Velocity", value: latest.velocityKms.toFixed(2), unit: "km/s", icon: Zap, spark: generateSparkline(20, 7.66, 0.005), color: "#22d3ee" },
    { label: "Power", value: latest.powerPct.toFixed(0), unit: "%", icon: Gauge, spark: generateSparkline(20, 82, 0.02), color: "#22c55e" },
    { label: "Temp", value: latest.tempC.toFixed(1), unit: "°C", icon: Thermometer, spark: generateSparkline(20, 21, 0.03), color: "#f59e0b" },
  ];

  const handleMissionClick = (missionId: string) => {
    setSelectedMissionId(missionId);
    const satId = MISSION_TO_SAT[missionId] ?? null;
    setSelectedSatelliteId(satId);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Status cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statusCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`glass-panel glass-panel-hover p-4 border ${c.border}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 tracking-widest uppercase font-display">{c.label}</span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <div className="telemetry-text text-3xl font-bold mt-2 text-white">{c.value}</div>
            </div>
          );
        })}
      </motion.div>

      {/* 3D scene + mission info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={item} className="lg:col-span-2 relative glass-panel overflow-hidden h-[420px] lg:h-[480px]">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <Radio className="w-4 h-4 text-accent-cyan" />
            <span className="text-xs font-display font-semibold tracking-widest text-slate-300 uppercase">Orbital View</span>
          </div>
          <div className="absolute top-3 right-3 z-10 text-[10px] font-mono text-slate-500">
            DRAG TO ROTATE · CLICK SATELLITE
          </div>
          <ErrorBoundary>
            <Scene3D />
          </ErrorBoundary>
          {selectedSat && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 left-3 z-10 glass-panel px-3 py-2 pointer-events-none"
            >
              <div className="text-xs font-display font-bold text-white">{selectedSat.name}</div>
              <div className="text-[10px] font-mono text-accent-cyan mt-0.5">
                {selectedSat.callsign} · {selectedSat.altitudeKm.toLocaleString()} km
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {selectedSat.status.toUpperCase()} · {selectedSat.orbitSpeedKms.toFixed(2)} km/s
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          <Panel title="Active Mission" icon={Rocket}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-lg font-display font-bold text-white">{mission.name}</div>
                <div className="text-xs font-mono text-accent-cyan">{mission.callsign}</div>
              </div>
              <StatusBadge status={mission.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Info label="Vehicle" value={mission.vehicle} />
              <Info label="Agency" value={mission.agency} />
              <Info label="Crew" value={`${mission.crew}`} />
              <Info label="Period" value={`${mission.periodMin} min`} />
              <Info label="Inclination" value={`${mission.inclinationDeg}°`} />
              <Info label="Altitude" value={`${mission.orbitAltitudeKm.toLocaleString()} km`} />
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">{mission.objective}</p>
          </Panel>

          <Panel title="Mission Roster" icon={Activity}>
            {q && filteredMissions.length === 0 && (
              <div className="text-xs text-slate-500 py-2 text-center">No missions match "{q}"</div>
            )}
            <div className="space-y-1">
              {filteredMissions.map((m) => {
                const isSelected = m.id === useStore.getState().selectedMissionId;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleMissionClick(m.id)}
                    className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-accent-blue/15 border border-accent-blue/30 text-white"
                        : "hover:bg-space-hover/40 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`status-dot ${statusDotColor(m.status)}`} />
                      <span className="font-display font-medium">{m.name}</span>
                    </div>
                    <span className="font-mono text-slate-500 text-[10px]">{m.callsign}</span>
                  </button>
                );
              })}
            </div>
          </Panel>
        </motion.div>
      </div>

      {/* Live backend risk summary */}
      <OverviewRiskSummary delay={0.1} />

      {/* Ground Track */}
      <motion.div variants={item}>
        <Panel title="Ground Track" icon={MapPin}>
          <GroundTrack height={150} />
          <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-slate-500">
            <span>
              LAT <span className="text-accent-cyan">{latest.latitude.toFixed(2)}°</span>
            </span>
            <span>
              LON <span className="text-accent-cyan">{latest.longitude.toFixed(2)}°</span>
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-accent-cyan" /> Current position
            </span>
          </div>
        </Panel>
      </motion.div>

      {/* KPI strip */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="glass-panel glass-panel-hover p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 tracking-widest uppercase font-display">{k.label}</span>
                <Icon className="w-3.5 h-3.5" style={{ color: k.color }} />
              </div>
              <div className="flex items-end justify-between">
                <div className="telemetry-text">
                  <span className="text-2xl font-bold text-white">{k.value}</span>
                  <span className="text-xs text-slate-500 ml-1">{k.unit}</span>
                </div>
                <Sparkline data={k.spark} color={k.color} width={80} height={28} />
              </div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-display">{label}</div>
      <div className="text-slate-200 font-medium mt-0.5">{value}</div>
    </div>
  );
}
