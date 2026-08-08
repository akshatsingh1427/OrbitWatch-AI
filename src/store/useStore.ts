import { create } from "zustand";
import {
  MISSIONS,
  SATELLITES,
  SUBSYSTEMS,
  COMMS_LINKS,
  generateTelemetryHistory,
  generateInitialAlerts,
  generateAlert,
  generateResourceData,
  nextTelemetryPoint,
  type Mission,
  type Satellite,
  type TelemetryPoint,
  type Subsystem,
  type CommsLink,
  type AlertEvent,
  type ResourceData,
} from "../lib/mockData";

export type TabId = "overview" | "telemetry" | "comms" | "timeline" | "resources" | "risk";

interface Toast {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

interface AppState {
  // navigation
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;

  // mission selection
  selectedMissionId: string;
  setSelectedMissionId: (id: string) => void;
  selectedMission: () => Mission;

  // 3D satellite selection
  selectedSatelliteId: string | null;
  setSelectedSatelliteId: (id: string | null) => void;

  // global satellite inspector (real backend NORAD id — driven by search / any tab)
  inspectNoradId: number | null;
  setInspectNoradId: (id: number | null) => void;

  // live telemetry
  telemetry: TelemetryPoint[];
  tickTelemetry: () => void;

  // subsystems
  subsystems: Subsystem[];
  tickSubsystems: () => void;

  // comms
  comms: CommsLink[];
  tickComms: () => void;

  // alerts
  alerts: AlertEvent[];
  pushAlert: (a?: AlertEvent) => void;

  // resources
  resources: ResourceData;
  tickResources: () => void;

  // toasts
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;

  // loading
  loaded: boolean;
  setLoaded: (v: boolean) => void;

  // search/filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // command palette + shortcut overlay
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  shortcutOverlayOpen: boolean;
  setShortcutOverlayOpen: (v: boolean) => void;

  // sound toggle
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;

  // notification bell
  unreadAlertCount: number;
  incrementUnread: () => void;
  clearUnread: () => void;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  activeTab: "overview",
  setActiveTab: (t) => set({ activeTab: t }),

  selectedMissionId: MISSIONS[0].id,
  setSelectedMissionId: (id) => set({ selectedMissionId: id }),
  selectedMission: () => MISSIONS.find((m) => m.id === get().selectedMissionId) ?? MISSIONS[0],

  selectedSatelliteId: null,
  setSelectedSatelliteId: (id) => set({ selectedSatelliteId: id }),

  inspectNoradId: null,
  setInspectNoradId: (id) => set({ inspectNoradId: id }),

  telemetry: generateTelemetryHistory(),
  tickTelemetry: () =>
    set((s) => {
      const prev = s.telemetry[s.telemetry.length - 1];
      const next = nextTelemetryPoint(prev);
      const trimmed = [...s.telemetry.slice(-59), next];
      return { telemetry: trimmed };
    }),

  subsystems: SUBSYSTEMS,
  tickSubsystems: () =>
    set((s) => ({
      subsystems: s.subsystems.map((sub) => ({
        ...sub,
        value: Math.max(20, Math.min(100, sub.value + (Math.random() - 0.5) * 2)),
      })),
    })),

  comms: COMMS_LINKS,
  tickComms: () =>
    set((s) => ({
      comms: s.comms.map((c) => ({
        ...c,
        throughputMbps: Math.max(0.01, c.throughputMbps + (Math.random() - 0.5) * 1.5),
        latencyMs: Math.max(50, c.latencyMs + (Math.random() - 0.5) * 12),
      })),
    })),

  alerts: generateInitialAlerts(),
  pushAlert: (a) =>
    set((s) => {
      const alert = a ?? generateAlert();
      return { alerts: [alert, ...s.alerts].slice(0, 50) };
    }),

  resources: generateResourceData(),
  tickResources: () =>
    set((s) => ({
      resources: {
        ...s.resources,
        fuelPct: Math.max(5, s.resources.fuelPct - Math.random() * 0.05),
        powerGeneratedKw: Math.max(8, s.resources.powerGeneratedKw + (Math.random() - 0.5) * 0.4),
        events24h: s.resources.events24h + (Math.random() > 0.7 ? 1 : 0),
      },
    })),

  toasts: [],
  pushToast: (t) =>
    set((s) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return { toasts: [...s.toasts, { ...t, id }] };
    }),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  loaded: false,
  setLoaded: (v) => set({ loaded: v }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  paletteOpen: false,
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  shortcutOverlayOpen: false,
  setShortcutOverlayOpen: (v) => set({ shortcutOverlayOpen: v }),

  // sound
  soundEnabled: true,
  setSoundEnabled: (v) => set({ soundEnabled: v }),

  // notifications
  unreadAlertCount: 0,
  incrementUnread: () => set((s) => ({ unreadAlertCount: s.unreadAlertCount + 1 })),
  clearUnread: () => set({ unreadAlertCount: 0 }),
  notifOpen: false,
  setNotifOpen: (v) => set({ notifOpen: v }),
}));

export { MISSIONS, SATELLITES };
