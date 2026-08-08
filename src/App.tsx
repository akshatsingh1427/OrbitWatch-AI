import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { useStore } from "./store/useStore";
import { useKeyboardShortcuts, ShortcutOverlay } from "./components/KeyboardShortcuts";
import Starfield from "./components/Starfield";
import Sidebar from "./components/Sidebar";
import HeaderClock from "./components/HeaderClock";
import Toasts from "./components/Toasts";
import CommandPalette from "./components/CommandPalette";
import NotificationBell from "./components/NotificationBell";
import OverviewTab from "./components/tabs/OverviewTab";
import TelemetryTab from "./components/tabs/TelemetryTab";
import CommsTab from "./components/tabs/CommsTab";
import TimelineTab from "./components/tabs/TimelineTab";
import ResourcesTab from "./components/tabs/ResourcesTab";
import { Skeleton } from "./components/ui";
import RiskPredictionTab from "./components/tabs/RiskPredictionTab";
import SatelliteDrawer from "./components/risk/SatelliteDrawer";

const TAB_LABELS: Record<string, string> = {
    overview: "Mission Status Overview",
    telemetry: "Spacecraft Telemetry",
    comms: "Comms & System Health",
    timeline: "Mission Timeline",
    resources: "Resource Management",
    risk: "AI Risk Prediction Center",
};

// Web Audio beep — no external files required
function playBeep(severity: "warning" | "critical") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = severity === "critical" ? 880 : 520;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
    // second pip for critical
    if (severity === "critical") {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.5);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
      osc2.start(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.85);
    }
  } catch {
    // AudioContext may be blocked before user interaction — silently ignore
  }
}

export default function App() {
  const {
    activeTab,
    loaded,
    setLoaded,
    tickTelemetry,
    tickSubsystems,
    tickComms,
    tickResources,
    pushAlert,
    pushToast,
    searchQuery,
    setSearchQuery,
    setShortcutOverlayOpen,
    soundEnabled,
    setSoundEnabled,
    incrementUnread,
    inspectNoradId,
    setInspectNoradId,
  } = useStore();

  useKeyboardShortcuts();

  // Simulated loading
  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 1400);
    return () => clearTimeout(id);
  }, [setLoaded]);

  // Live data ticks
  useEffect(() => {
    const telemetryId = setInterval(tickTelemetry, 2000);
    const subsystemsId = setInterval(tickSubsystems, 3000);
    const commsId = setInterval(tickComms, 2500);
    const resourcesId = setInterval(tickResources, 4000);
    return () => {
      clearInterval(telemetryId);
      clearInterval(subsystemsId);
      clearInterval(commsId);
      clearInterval(resourcesId);
    };
  }, [tickTelemetry, tickSubsystems, tickComms, tickResources]);

  const handleNewAlert = useCallback(() => {
    pushAlert();
    const latest = useStore.getState().alerts[0];
    if (latest && latest.severity !== "info") {
      pushToast({ severity: latest.severity, message: `${latest.source}: ${latest.message}` });
      if (useStore.getState().soundEnabled) {
        playBeep(latest.severity);
      }
    }
    incrementUnread();
  }, [pushAlert, pushToast, incrementUnread]);

  // Random alert + toast generator
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.55) handleNewAlert();
    }, 12000);
    return () => clearInterval(id);
  }, [handleNewAlert]);

const TabComponent = {
    overview: OverviewTab,
    telemetry: TelemetryTab,
    comms: CommsTab,
    timeline: TimelineTab,
    resources: ResourcesTab,
    risk: RiskPredictionTab,
}[activeTab];

  return (
    <div className="relative min-h-screen flex">
      <Starfield />

      <div className="relative z-10 flex w-full">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-space-border bg-space-bg/70 backdrop-blur-md">
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <h1 className="text-sm font-display font-semibold text-white truncate tracking-wide">
                  {TAB_LABELS[activeTab]}
                </h1>
                <p className="text-[10px] text-slate-500 tracking-widest uppercase font-mono">
                  ORBITAL · MISSION CONTROL CENTER
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 ml-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    data-search-input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter..."
                    className="w-40 bg-space-panel/60 border border-space-border rounded-lg pl-8 pr-12 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-accent-blue/50 focus:w-52 transition-all font-sans"
                  />
                  <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1 py-0.5 rounded bg-space-bg/60 border border-space-border text-slate-500">/</kbd>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                  soundEnabled
                    ? "text-accent-cyan hover:bg-space-hover/40"
                    : "text-slate-600 hover:text-slate-400 hover:bg-space-hover/40"
                }`}
                title={soundEnabled ? "Sound on — click to mute" : "Sound off — click to enable"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Keyboard shortcuts */}
              <button
                onClick={() => setShortcutOverlayOpen(true)}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-hover/40 transition-colors"
                title="Keyboard shortcuts (?)"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Notification bell */}
              <NotificationBell />

              <HeaderClock />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 overflow-x-hidden">
            {!loaded ? (
              <LoadingSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabComponent />
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>

      <Toasts />
      <CommandPalette />
      <ShortcutOverlay />
      <SatelliteDrawer noradId={inspectNoradId} onClose={() => setInspectNoradId(null)} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-96" />
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}
