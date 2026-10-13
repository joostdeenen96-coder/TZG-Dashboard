export type WaterStationId = "kaub" | "ruhrort" | "maxau";

export type WaterStatus = "laag" | "normaal" | "hoog";

export type WaterTrend = "stijgend" | "dalend" | "gelijk";

export type WaterStationResult = {
  id: WaterStationId;
  name: string;
  river: string;
  levelCm: number | null;
  changeCm: number | null;
  trend: WaterTrend | null;
  status: WaterStatus | null;
  updatedAt: string | null;
  source: string;
  error: string | null;
};

export type WaterLevelsResponse = Record<WaterStationId, WaterStationResult>;

export interface WaterLevelProvider {
  getCurrentData(): Promise<WaterStationResult>;
}

export function trendFromChange(changeCm: number): WaterTrend {
  if (changeCm > 0) return "stijgend";
  if (changeCm < 0) return "dalend";
  return "gelijk";
}

export function failedStation(
  meta: { id: WaterStationId; name: string; river: string; source: string },
  error: unknown,
): WaterStationResult {
  const message = error instanceof Error && error.message ? error.message : "Bron niet bereikbaar.";
  return {
    id: meta.id,
    name: meta.name,
    river: meta.river,
    levelCm: null,
    changeCm: null,
    trend: null,
    status: null,
    updatedAt: null,
    source: meta.source,
    error: message,
  };
}
