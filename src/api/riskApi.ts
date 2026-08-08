// Typed client for the OrbitWatch AI Risk backend.
// Base URL is configurable via VITE_API_BASE_URL (see .env.example).

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(`Unable to reach backend at ${API_BASE_URL}`, 0);
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body?.detail ?? detail;
    } catch {
      // ignore — non-JSON error body
    }
    throw new ApiError(detail || `Request failed (${response.status})`, response.status);
  }

  return response.json() as Promise<T>;
}

// ---------- Types ----------

export interface HealthResponse {
  status: string;
  database: string;
  predictions: number;
}

export interface HomeResponse {
  message: string;
}

export interface StatisticsResponse {
  total_satellites: number;
  high_risk: number;
  low_risk: number;
  average_probability: number;
}

export type RiskLabel = 0 | 1;

export interface RiskSummary {
  norad_id: number;
  object_name: string;
  risk_label: RiskLabel;
  risk_probability: number;
  altitude_km: number | null;
}

export interface SatelliteDetail extends RiskSummary {
  inclination: number | null;
  raan: number | null;
  eccentricity: number | null;
  mean_motion: number | null;
  bstar: number | null;
}

export interface AlertRow extends RiskSummary {
  id?: number;
  prediction_time?: string;
}

// ---------- Endpoints ----------

export function getHome() {
  return request<HomeResponse>("/");
}

export function getHealth() {
  return request<HealthResponse>("/health");
}

export function getStatistics() {
  return request<StatisticsResponse>("/statistics");
}

export function getTopRisk(limit = 20) {
  return request<RiskSummary[]>(`/risk/top?limit=${limit}`);
}

export function getSatellite(noradId: number) {
  return request<SatelliteDetail>(`/risk/${noradId}`);
}

export function getAlerts(limit = 25) {
  return request<AlertRow[]>(`/alerts?limit=${limit}`);
}

export function searchSatellites(query: string) {
  return request<AlertRow[]>(`/search?q=${encodeURIComponent(query)}`);
}

export function getExportJsonUrl() {
  return `${API_BASE_URL}/export/json`;
}

export function getExportCsvUrl() {
  return `${API_BASE_URL}/export/csv`;
}

/** Triggers a browser download of the given export URL. */
export function downloadExport(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export { API_BASE_URL };
