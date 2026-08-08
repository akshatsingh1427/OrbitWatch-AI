import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  Radio,
  GitBranch,
  BatteryCharging,
  SatelliteDish,
  ShieldAlert,
  Command,
} from "lucide-react";
import { useStore, type TabId } from "../store/useStore";

const TABS: {
    id: TabId;
    label: string;
    icon: typeof LayoutDashboard;
    shortcut: string;
}[] = [
    {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        shortcut: "1",
    },
    {
        id: "telemetry",
        label: "Telemetry",
        icon: Activity,
        shortcut: "2",
    },
    {
        id: "comms",
        label: "Comms & Health",
        icon: Radio,
        shortcut: "3",
    },
    {
        id: "timeline",
        label: "Timeline",
        icon: GitBranch,
        shortcut: "4",
    },
    {
        id: "resources",
        label: "Resources",
        icon: BatteryCharging,
        shortcut: "5",
    },
    {
        id: "risk",
        label: "AI Risk Center",
        icon: ShieldAlert,
        shortcut: "6",
    },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, setPaletteOpen } = useStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-space-border bg-space-surface/50 backdrop-blur-md">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-space-border">
          <div className="relative">
            <SatelliteDish className="w-7 h-7 text-accent-cyan" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
          </div>
          <div className="leading-none">
            <div className="font-display font-bold tracking-[0.2em] text-sm text-white">ORBITAL</div>
            <div className="text-[10px] text-slate-500 tracking-widest mt-0.5 font-mono">MISSION CONTROL</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-medium transition-colors ${
                  active ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-space-hover/40"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-accent-blue/15 border border-accent-blue/40"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10" style={{ width: 18, height: 18 }} />
                <span className="relative z-10">{tab.label}</span>
                <kbd className="relative z-10 ml-auto hidden lg:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-bg/60 border border-space-border text-slate-500">
                  {tab.shortcut}
                </kbd>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setPaletteOpen(true)}
          className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 border border-space-border hover:border-accent-blue/40 hover:text-slate-200 transition-colors font-display"
        >
          <Command className="w-3.5 h-3.5" />
          <span>Command Menu</span>
          <kbd className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-space-bg/60 border border-space-border">⌘K</kbd>
        </button>

        <div className="px-5 py-3 border-t border-space-border">
          <div className="text-[10px] text-slate-600 tracking-widest font-mono">FRONTEND WARS 2026</div>
          <div className="text-xs text-slate-500 mt-0.5 font-mono">v1.0.0 · BUILD 2026.07</div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around bg-space-surface/90 backdrop-blur-lg border-t border-space-border px-1 py-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active ? "text-accent-cyan" : "text-slate-500"
              }`}
            >
              <Icon style={{ width: 20, height: 20 }} />
              <span className="text-[9px] font-display font-medium">{tab.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
