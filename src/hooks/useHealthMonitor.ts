import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../api/riskApi";

/**
 * Wraps GET /health with client-side round-trip timing and a last-successful-
 * request timestamp. No new backend endpoints — purely measured from the
 * existing request/response cycle.
 */
export function useHealthMonitor() {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastSuccessAt, setLastSuccessAt] = useState<Date | null>(null);

  const query = useQuery({
    queryKey: ["health", "monitor"],
    queryFn: async () => {
      const start = performance.now();
      const result = await getHealth();
      setLatencyMs(Math.round(performance.now() - start));
      setLastSuccessAt(new Date());
      return result;
    },
    refetchInterval: 60_000,
    staleTime: 60_000,
    retry: 3,
  });

  return { ...query, latencyMs, lastSuccessAt, online: !query.isError };
}
