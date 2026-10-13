export type WaterStationId = "kaub" | "ruhrort" | "maxau";

export type WaterStatus = "laag" | "normaal" | "hoog";

export type WaterTrend = "stijgend" | "dalend" | "gelijk";

export const WATER_LEVEL_UPDATED_AT = "2026-10-13T15:40:00+02:00";

export type WaterLevelReading = {
  id: WaterStationId;
  name: string;
  river: string;
  levelCm: number;
  changeCm: number;
  trend: WaterTrend;
  status: WaterStatus;
  updatedAt: string;
};

export interface WaterLevelProvider {
  getReading(): WaterLevelReading;
}
