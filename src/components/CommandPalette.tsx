import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowRight, LayoutDashboard, Activity, Radio, GitBranch, BatteryCharging, Satellite } from "lucide-react";
import { useStore, type TabId, MISSIONS } from "../store/useStore";
import { useEffect, useMemo, useState } from "react";
import { useSatelliteSearch } from "../hooks/useRiskData";
import { RiskBadge } from "./risk/RiskVisuals";

interface CommandItem {
  type: "tab" | "mission" | "satellite";
  id: string;
  label: string;
  icon: typeof LayoutDashboard | null;
  sub?: string;
  noradId?: number;
  probability?: number;
}

const TAB_ITEMS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "telemetry", label: "Telemetry", icon: Activity },
  { id: "comms", label: "Comms & Health", icon: Radio },
  { id: "timeline", label: "Timeline", icon: GitBranch },
  { id: "resources", label: "Resources", icon: BatteryCharging },
];

export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen, setActiveTab, setSelectedMissionId, setSearchQuery, setInspectNoradId } = useStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Real backend satellite search — GET /search?q=, only fires with a query.
  const satelliteSearch = useSatelliteSearch(query);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    const tabs: CommandItem[] = TAB_ITEMS.filter((t) => !q || t.label.toLowerCase().includes(q)).map((t) => ({
      type: "tab",
      id: t.id,
      label: t.label,
      icon: t.icon,
      sub: undefined,
    }));
    const missions: CommandItem[] = MISSIONS.filter((m) => !q || m.name.toLowerCase().includes(q) || m.callsign.toLowerCase().includes(q)).map((m) => ({
      type: "mission",
      id: m.id,
      label: m.name,
      icon: null,
      sub: m.callsign,
    }));
    const satellites: CommandItem[] = (satelliteSearch.data ?? []).slice(0, 8).map((s) => ({
      type: "satellite",
      id: `sat-${s.norad_id}`,
      label: s.object_name,
      icon: Satellite,
      sub: `NORAD ${s.norad_id}`,
      noradId: s.norad_id,
      probability: s.risk_probability,
    }));
    return [...satellites, ...tabs, ...missions];
  }, [query, satelliteSearch.data]);

  useEffect(() => {
    if (!paletteOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [paletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [paletteOpen, setPaletteOpen]);

  const execute = (item: (typeof results)[number]) => {
    if (item.type === "tab") {
      setActiveTab(item.id as TabId);
    } else if (item.type === "satellite" && item.noradId) {
      setInspectNoradId(item.noradId);
      setActiveTab("risk");
    } else {
      setSelectedMissionId(item.id);
      setActiveTab("overview");
      setSearchQuery("");
    }
    setPaletteOpen(false);
  };

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg mx-4 glass-panel border-accent-blue/30 shadow-[0_0_40px_-8px_rgba(59,130,246,0.4)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-space-border">
              <Search className="w-4 h-4 text-accent-cyan" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.min(i + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && results[activeIndex]) {
                    execute(results[activeIndex]);
                  }
                }}
                placeholder="Search satellites, tabs, missions..."
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-bg/60 border border-space-border text-slate-500">ESC</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-thin p-2">
              {query.trim() && satelliteSearch.isLoading && (
                <div className="px-3 py-2 text-[11px] font-mono text-accent-cyan flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                  Searching backend catalog…
                </div>
              )}
              {results.length === 0 && !satelliteSearch.isLoading && (
                <div className="px-3 py-6 text-center text-sm text-slate-500">No results</div>
              )}
              {results.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => execute(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      i === activeIndex ? "bg-accent-blue/15 text-white" : "text-slate-300 hover:bg-space-hover/40"
                    }`}
                  >
                    {Icon ? <Icon className="w-4 h-4 text-accent-cyan" /> : <div className="w-4 h-4 rounded-full bg-accent-blue/40" />}
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.type === "satellite" && item.probability !== undefined && (
                      <RiskBadge probability={item.probability} />
                    )}
                    {item.sub && <span className="text-xs font-mono text-slate-500">{item.sub}</span>}
                    <span className="text-[10px] uppercase tracking-wider text-slate-600">{item.type}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
