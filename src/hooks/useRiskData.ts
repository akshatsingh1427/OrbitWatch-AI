import { useQuery } from "@tanstack/react-query";
import {
  getAlerts,
  getHealth,
  getSatellite,
  getStatistics,
  getTopRisk,
  searchSatellites,
} from "../api/riskApi";

// Refresh cadences per spec
const STATISTICS_REFRESH_MS = 30_000;
const ALERTS_REFRESH_MS = 15_000;
const HEALTH_REFRESH_MS = 60_000;

/** Backend health — polled every 60s, powers "Backend Status" indicators. */
export function useBackendHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: HEALTH_REFRESH_MS,
    staleTime: HEALTH_REFRESH_MS,
    retry: 3,
  });
}

/** Fleet-wide statistics — polled every 30s. */
export function useStatistics() {
  return useQuery({
    queryKey: ["statistics"],
    queryFn: getStatistics,
    refetchInterval: STATISTICS_REFRESH_MS,
    staleTime: STATISTICS_REFRESH_MS,
    retry: 3,
  });
}

/** Highest-risk satellites, ordered by probability. Large limits (used when
 *  filtering to lower risk tiers) are cached longer and don't auto-poll to
 *  avoid re-downloading the full catalog every 30s. */
export function useTopRisk(limit = 20) {
  const heavy = limit > 200;
  return useQuery({
    queryKey: ["risk", "top", limit],
    queryFn: () => getTopRisk(limit),
    refetchInterval: heavy ? false : STATISTICS_REFRESH_MS,
    staleTime: heavy ? 5 * 60_000 : 20_000,
    retry: 3,
  });
}

/** Full ML prediction + orbital elements for a single satellite. */
export function useSatellite(noradId: number | null) {
  return useQuery({
    queryKey: ["risk", "satellite", noradId],
    queryFn: () => getSatellite(noradId as number),
    enabled: noradId !== null,
    retry: 2,
  });
}

/** High-risk alert feed — polled every 15s. */
export function useAlerts(limit = 25) {
  return useQuery({
    queryKey: ["alerts", limit],
    queryFn: () => getAlerts(limit),
    refetchInterval: ALERTS_REFRESH_MS,
    staleTime: 10_000,
    retry: 3,
  });
}

/** Server-side name search, only runs once a query is present. */
export function useSatelliteSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["search", trimmed],
    queryFn: () => searchSatellites(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 15_000,
    retry: 1,
  });
}
