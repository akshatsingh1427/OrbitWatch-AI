import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  useAlerts,
  useBackendHealth,
  useStatistics,
  useTopRisk,
} from "../../hooks/useRiskData";
import RiskHero from "../risk/RiskHero";
import RiskTable, { type RiskFilterTier } from "../risk/RiskTable";
import RiskCharts from "../risk/RiskCharts";
import AlertCenter from "../risk/AlertCenter";
import StatusPanel from "../risk/StatusPanel";
import SatelliteDrawer from "../risk/SatelliteDrawer";

export default function RiskPredictionTab() {
  const [selectedNoradId, setSelectedNoradId] = useState<number | null>(null);
  const [filter, setFilter] = useState<RiskFilterTier>("all");

  const statistics = useStatistics();
  const health = useBackendHealth();
  const alerts = useAlerts(15);

  // /risk/top is sorted by probability descending — a small limit only ever
  // returns high-risk rows. When the person filters to LOW/MEDIUM we need a
  // much larger page so those lower-probability rows are actually in range.
  const tableLimit = useMemo(() => {
    if (filter === "all" || filter === "high") return 60;
    return statistics.data?.total_satellites ?? 20_000;
  }, [filter, statistics.data]);

  const topRisk = useTopRisk(tableLimit);
  // Charts stay on a light, fast-refreshing sample regardless of the table filter.
  const chartSample = useTopRisk(60);

  const anyBackendUnreachable =
    statistics.isError && topRisk.isError && health.isError;

  return (
    <div className="space-y-6">
      {anyBackendUnreachable && (
        <div className="flex items-center gap-2 rounded-xl border border-status-critical/30 bg-status-critical/10 px-4 py-3 text-sm text-status-critical">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Can't reach the OrbitWatch backend. Confirm the API is running and{" "}
            <code className="font-mono text-xs">VITE_API_BASE_URL</code> is set correctly.
          </span>
          <button
            onClick={() => {
              statistics.refetch();
              topRisk.refetch();
              health.refetch();
              alerts.refetch();
            }}
            className="ml-auto flex items-center gap-1 text-xs font-mono uppercase tracking-wide hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      <RiskHero
        statistics={statistics.data}
        isLoading={statistics.isLoading}
        isError={statistics.isError}
      />

      <RiskCharts
        statistics={statistics.data}
        satellites={chartSample.data ?? []}
        isLoading={chartSample.isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <RiskTable
            satellites={topRisk.data ?? []}
            isLoading={topRisk.isLoading}
            isError={topRisk.isError}
            onSelect={setSelectedNoradId}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>
        <div className="space-y-4">
          <StatusPanel
            health={health.data}
            isLoading={health.isLoading}
            isError={health.isError}
          />
          <AlertCenter
            alerts={alerts.data ?? []}
            isLoading={alerts.isLoading}
            isError={alerts.isError}
            onSelect={setSelectedNoradId}
          />
        </div>
      </div>

      <SatelliteDrawer noradId={selectedNoradId} onClose={() => setSelectedNoradId(null)} />
    </div>
  );
}
