// ============================================================================
// lib/mockData.ts
// Typed mock-data generators + simulated live telemetry for the
// Space Mission Control dashboard. 100% client-side, no backend.
// ============================================================================

export type MissionStatus = "active" | "nominal" | "warning" | "critical" | "completed";
export type SubsystemHealth = "nominal" | "warning" | "critical" | "offline";
export type AlertSeverity = "info" | "warning" | "critical";

export interface Mission {
  id: string;
  name: string;
  callsign: string;
  status: MissionStatus;
  vehicle: string;
  agency: string;
  launchSite: string;
  launchDate: string;
  crew: number;
  orbitAltitudeKm: number;
  inclinationDeg: number;
  periodMin: number;
  objective: string;
}

export interface Satellite {
  id: string;
  name: string;
  callsign: string;
  altitudeKm: number;
  inclinationDeg: number;
  status: MissionStatus;
  orbitSpeedKms: number;
  color: string;
}

export interface TelemetryPoint {
  t: number; // unix ms
  altitudeKm: number;
  velocityKms: number;
  latitude: number;
  longitude: number;
  signalDbm: number;
  powerPct: number;
  tempC: number;
}

export interface Subsystem {
  name: string;
  health: SubsystemHealth;
  value: number; // 0-100
  unit: string;
}

export interface CommsLink {
  name: string;
  direction: "uplink" | "downlink";
  status: "online" | "degraded" | "offline";
  throughputMbps: number;
  latencyMs: number;
}

export interface AlertEvent {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  source: string;
  message: string;
}

export interface TimelineStage {
  id: string;
  name: string;
  timestamp: string;
  status: "completed" | "active" | "upcoming";
  description: string;
}

export interface ResourceData {
  fuelPct: number;
  fuelKg: number;
  powerGeneratedKw: number;
  powerBySource: { source: string; kw: number }[];
  dataUsageGb: number;
  dataByHour: { hour: string; gb: number }[];
  events24h: number;
}

// ---------------------------------------------------------------------------
// Deterministic-ish RNG so values look plausible but jitter naturally.
// ---------------------------------------------------------------------------
let seed = 42;
function rand(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
function randRange(min: number, max: number): number {
  return min + rand() * (max - min);
}
function randInt(min: number, max: number): number {
  return Math.floor(randRange(min, max + 1));
}
function jitter(base: number, pct: number): number {
  return base * (1 + (rand() - 0.5) * 2 * pct);
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------
export const MISSIONS: Mission[] = [
  {
    id: "orb-001",
    name: "Orion-7",
    callsign: "ORN-7",
    status: "active",
    vehicle: "Falcon Heavy",
    agency: "UNSA",
    launchSite: "Pad 39A, Kennedy",
    launchDate: "2026-06-12T09:24:00Z",
    crew: 4,
    orbitAltitudeKm: 408,
    inclinationDeg: 51.6,
    periodMin: 92.7,
    objective: "Low-Earth orbit science platform deployment",
  },
  {
    id: "orb-002",
    name: "Artemis Relay",
    callsign: "ART-R",
    status: "nominal",
    vehicle: "Delta IV Heavy",
    agency: "ESA",
    launchSite: "Kourou, French Guiana",
    launchDate: "2026-05-28T14:10:00Z",
    crew: 0,
    orbitAltitudeKm: 35786,
    inclinationDeg: 0.1,
    periodMin: 1436,
    objective: "Geostationary lunar relay backbone",
  },
  {
    id: "orb-003",
    name: "Helios Probe",
    callsign: "HLP-3",
    status: "warning",
    vehicle: "SLS Block 1",
    agency: "NASA",
    launchSite: "Pad 39B, Kennedy",
    launchDate: "2026-04-03T11:45:00Z",
    crew: 0,
    orbitAltitudeKm: 71400,
    inclinationDeg: 28.5,
    periodMin: 4102,
    objective: "Solar wind magnetometer survey",
  },
  {
    id: "orb-004",
    name: "Vega Supply",
    callsign: "VGS-9",
    status: "completed",
    vehicle: "Soyuz-2",
    agency: "Roscosmos",
    launchSite: "Baikonur Cosmodrome",
    launchDate: "2026-02-19T06:30:00Z",
    crew: 3,
    orbitAltitudeKm: 412,
    inclinationDeg: 51.6,
    periodMin: 92.9,
    objective: "ISS resupply cargo run",
  },
];

// ---------------------------------------------------------------------------
// Satellites for the 3D scene — tied to mission orbital data.
// ---------------------------------------------------------------------------
export const SATELLITES: Satellite[] = [
  { id: "sat-1", name: "Orion-7", callsign: "ORN-7", altitudeKm: 408, inclinationDeg: 51.6, status: "active", orbitSpeedKms: 7.66, color: "#3b82f6" },
  { id: "sat-2", name: "Artemis Relay", callsign: "ART-R", altitudeKm: 35786, inclinationDeg: 0.1, status: "nominal", orbitSpeedKms: 3.07, color: "#22d3ee" },
  { id: "sat-3", name: "Helios Probe", callsign: "HLP-3", altitudeKm: 71400, inclinationDeg: 28.5, status: "warning", orbitSpeedKms: 2.4, color: "#f59e0b" },
];

// ---------------------------------------------------------------------------
// Telemetry time-series generation
// ---------------------------------------------------------------------------
export function generateTelemetryHistory(points = 60): TelemetryPoint[] {
  const out: TelemetryPoint[] = [];
  const now = Date.now();
  for (let i = points - 1; i >= 0; i--) {
    const t = now - i * 5000;
    const phase = (i / points) * Math.PI * 4;
    out.push({
      t,
      altitudeKm: jitter(408 + Math.sin(phase) * 6, 0.005),
      velocityKms: jitter(7.66 + Math.cos(phase) * 0.04, 0.003),
      latitude: jitter(28.5 + Math.sin(phase) * 12, 0.01),
      longitude: jitter(-80.6 + (i * 4) % 360 - 180, 0.005),
      signalDbm: jitter(-72, 0.06),
      powerPct: jitter(82, 0.02),
      tempC: jitter(21, 0.05),
    });
  }
  return out;
}

export function nextTelemetryPoint(prev: TelemetryPoint): TelemetryPoint {
  const t = Date.now();
  const phase = (Date.now() / 60000) * Math.PI * 2;
  return {
    t,
    altitudeKm: jitter(prev.altitudeKm + Math.sin(phase) * 0.4, 0.004),
    velocityKms: jitter(prev.velocityKms, 0.002),
    latitude: jitter(prev.latitude + 0.05, 0.01),
    longitude: (prev.longitude + 0.3) % 360,
    signalDbm: jitter(prev.signalDbm, 0.04),
    powerPct: Math.max(20, Math.min(100, jitter(prev.powerPct, 0.01))),
    tempC: jitter(prev.tempC, 0.03),
  };
}

// ---------------------------------------------------------------------------
// Subsystems + comms
// ---------------------------------------------------------------------------
export const SUBSYSTEMS: Subsystem[] = [
  { name: "Propulsion", health: "nominal", value: 96, unit: "%" },
  { name: "Power", health: "nominal", value: 82, unit: "%" },
  { name: "Thermal", health: "warning", value: 71, unit: "%" },
  { name: "Guidance", health: "nominal", value: 99, unit: "%" },
  { name: "Comms", health: "nominal", value: 88, unit: "%" },
  { name: "Life Support", health: "nominal", value: 94, unit: "%" },
  { name: "Payload", health: "warning", value: 68, unit: "%" },
  { name: "Avionics", health: "nominal", value: 91, unit: "%" },
];

export const COMMS_LINKS: CommsLink[] = [
  { name: "S-Band Primary", direction: "downlink", status: "online", throughputMbps: 8.4, latencyMs: 142 },
  { name: "X-Band Backup", direction: "downlink", status: "degraded", throughputMbps: 3.1, latencyMs: 287 },
  { name: "Ku-Band High Gain", direction: "downlink", status: "online", throughputMbps: 51.2, latencyMs: 98 },
  { name: "Command Uplink", direction: "uplink", status: "online", throughputMbps: 0.256, latencyMs: 156 },
  { name: "Telemetry Uplink", direction: "uplink", status: "online", throughputMbps: 0.128, latencyMs: 161 },
];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
const ALERT_TEMPLATES: { severity: AlertSeverity; source: string; message: string }[] = [
  { severity: "info", source: "Guidance", message: "Star tracker re-calibration complete" },
  { severity: "info", source: "Comms", message: "X-Band handoff to ground station DSN-43" },
  { severity: "warning", source: "Thermal", message: "Radiator loop B temp +3.2C above nominal" },
  { severity: "warning", source: "Payload", message: "Science instrument 2 draw current elevated" },
  { severity: "critical", source: "Power", message: "Solar array gimbal angle deviation detected" },
  { severity: "info", source: "Propulsion", message: "RCS thruster cluster cold-fire checkout nominal" },
  { severity: "warning", source: "Comms", message: "X-Band backup link latency above threshold" },
];

export function generateInitialAlerts(count = 8): AlertEvent[] {
  const out: AlertEvent[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const tpl = ALERT_TEMPLATES[randInt(0, ALERT_TEMPLATES.length - 1)];
    out.push({
      id: `alert-${now}-${i}`,
      timestamp: now - i * randInt(45000, 180000),
      severity: tpl.severity,
      source: tpl.source,
      message: tpl.message,
    });
  }
  return out.sort((a, b) => b.timestamp - a.timestamp);
}

export function generateAlert(): AlertEvent {
  const tpl = ALERT_TEMPLATES[randInt(0, ALERT_TEMPLATES.length - 1)];
  return {
    id: `alert-${Date.now()}-${randInt(0, 9999)}`,
    timestamp: Date.now(),
    severity: tpl.severity,
    source: tpl.source,
    message: tpl.message,
  };
}

// ---------------------------------------------------------------------------
// Mission timeline
// ---------------------------------------------------------------------------
export const TIMELINE_STAGES: TimelineStage[] = [
  { id: "s1", name: "Launch", timestamp: "T-00:00:00", status: "completed", description: "Liftoff from Kennedy Space Center, all engines nominal." },
  { id: "s2", name: "Orbit Insertion", timestamp: "T+00:08:42", status: "completed", description: "MECO and second-stage burn achieved target orbit." },
  { id: "s3", name: "System Check", timestamp: "T+00:45:10", status: "completed", description: "Full spacecraft systems checkout, all green." },
  { id: "s4", name: "Payload Ops", timestamp: "T+02:14:00", status: "active", description: "Science platform deployment and instrument activation in progress." },
  { id: "s5", name: "Data Downlink", timestamp: "T+06:30:00", status: "upcoming", description: "High-rate science data downlink to ground network." },
  { id: "s6", name: "Mission End", timestamp: "T+18:00:00", status: "upcoming", description: "Safe de-orbit and recovery operations." },
];

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------
export function generateResourceData(): ResourceData {
  return {
    fuelPct: 62,
    fuelKg: 1240,
    powerGeneratedKw: 14.8,
    powerBySource: [
      { source: "Solar Array A", kw: 6.2 },
      { source: "Solar Array B", kw: 5.8 },
      { source: "RTG", kw: 2.1 },
      { source: "Battery", kw: 0.7 },
    ],
    dataUsageGb: 482.3,
    dataByHour: Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, "0")}:00`,
      gb: jitter(18 + Math.sin(h / 24 * Math.PI * 2) * 8, 0.15),
    })),
    events24h: 127,
  };
}

export function generateSparkline(points = 20, base = 100, variance = 0.1): number[] {
  return Array.from({ length: points }, (_, i) =>
    jitter(base + Math.sin(i / 3) * base * variance, variance)
  );
}

// ---------------------------------------------------------------------------
// Status counts for overview
// ---------------------------------------------------------------------------
export function getMissionStatusCounts() {
  const counts = { active: 0, nominal: 0, warning: 0, critical: 0, completed: 0 };
  for (const m of MISSIONS) counts[m.status]++;
  return counts;
}
