import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileJson,
  Search,
  SlidersHorizontal,
  Satellite as SatelliteIcon,
} from "lucide-react";
import type { RiskSummary } from "../../api/riskApi";
import { downloadExport, getExportCsvUrl, getExportJsonUrl } from "../../api/riskApi";
import { Skeleton } from "../ui";
import { ProbabilityBar, RiskBadge, riskTier } from "./RiskVisuals";

export type RiskFilterTier = "all" | "low" | "medium" | "high";
const PAGE_SIZE = 10;

interface Props {
  satellites: RiskSummary[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (noradId: number) => void;
  filter: RiskFilterTier;
  onFilterChange: (tier: RiskFilterTier) => void;
}

export default function RiskTable({
  satellites,
  isLoading,
  isError,
  onSelect,
  filter,
  onFilterChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return satellites.filter((sat) => {
      const matchesQuery =
        !q || sat.object_name.toLowerCase().includes(q) || String(sat.norad_id).includes(q);
      const matchesFilter = filter === "all" || riskTier(sat.risk_probability) === filter;
      return matchesQuery && matchesFilter;
    });
  }, [satellites, query, filter]);

  useEffect(() => setPage(1), [query, filter, satellites]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFetchingLargePage = isLoading && filter !== "all" && filter !== "high";

  return (
    <div className="glass-panel glass-panel-hover relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent" />

      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
              <SatelliteIcon className="w-3.5 h-3.5 text-accent-cyan" />
            </span>
            <h3 className="text-xs font-semibold tracking-widest text-slate-300 uppercase">
              Tracked Objects
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              ({filtered.length.toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or NORAD ID..."
                className="w-48 bg-space-bg/60 border border-space-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-accent-blue/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] transition-all"
              />
            </div>

            <div className="flex items-center gap-1 bg-space-bg/60 border border-space-border rounded-lg p-0.5">
              <SlidersHorizontal className="w-3 h-3 text-slate-500 ml-1.5" />
              {(["all", "low", "medium", "high"] as RiskFilterTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => onFilterChange(tier)}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wide transition-colors ${
                    filter === tier
                      ? tier === "high"
                        ? "bg-status-critical/20 text-status-critical"
                        : tier === "medium"
                        ? "bg-status-warning/20 text-status-warning"
                        : tier === "low"
                        ? "bg-status-nominal/20 text-status-nominal"
                        : "bg-accent-blue/20 text-accent-cyan"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <button
              onClick={() => downloadExport(getExportCsvUrl(), "risk_predictions.csv")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 border border-space-border bg-space-bg/60 hover:border-accent-cyan/50 hover:text-accent-cyan transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => downloadExport(getExportJsonUrl(), "risk_predictions.json")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 border border-space-border bg-space-bg/60 hover:border-accent-cyan/50 hover:text-accent-cyan transition-colors"
            >
              <FileJson className="w-3.5 h-3.5" /> JSON
            </button>
          </div>
        </div>

        {isFetchingLargePage && (
          <p className="text-[10px] font-mono text-accent-cyan/80 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            Scanning full catalog for {filter}-risk objects…
          </p>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-sm text-status-critical">
            Failed to load satellite risk data from the backend.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No {filter !== "all" ? `${filter}-risk ` : ""}satellites match this query.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin rounded-lg border border-space-border/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-mono bg-space-bg/40 border-b border-space-border">
                    <th className="py-2.5 px-3 font-medium">NORAD</th>
                    <th className="py-2.5 px-3 font-medium">Satellite</th>
                    <th className="py-2.5 px-3 font-medium">Risk</th>
                    <th className="py-2.5 px-3 font-medium min-w-[140px]">Probability</th>
                    <th className="py-2.5 px-3 font-medium">Altitude</th>
                    <th className="py-2.5 px-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((sat, i) => (
                    <motion.tr
                      key={sat.norad_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.2) }}
                      className="border-b border-space-border/40 last:border-b-0 hover:bg-space-hover/30 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-xs font-mono text-slate-400">{sat.norad_id}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-200 font-medium">{sat.object_name}</td>
                      <td className="py-2.5 px-3">
                        <RiskBadge probability={sat.risk_probability} />
                      </td>
                      <td className="py-2.5 px-3">
                        <ProbabilityBar probability={sat.risk_probability} />
                      </td>
                      <td className="py-2.5 px-3 text-xs font-mono text-slate-400">
                        {sat.altitude_km ? `${sat.altitude_km.toFixed(0)} km` : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onSelect(sat.norad_id)}
                          className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wide border border-space-border bg-space-bg/60 text-slate-300 hover:border-accent-cyan/50 hover:text-accent-cyan hover:shadow-[0_0_12px_-2px_rgba(34,211,238,0.4)] transition-all"
                        >
                          Inspect
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-space-border/40">
              <span className="text-[10px] font-mono text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-space-border bg-space-bg/60 text-slate-400 hover:text-white hover:border-accent-cyan/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-space-border bg-space-bg/60 text-slate-400 hover:text-white hover:border-accent-cyan/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
