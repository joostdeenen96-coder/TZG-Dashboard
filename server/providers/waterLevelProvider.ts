export type WaterStationId = "kaub" | "ruhrort" | "maxau";

export type WaterStatus = "laag" | "normaal" | "hoog";

export type WaterLevelReading = {
  id: WaterStationId;
  name: string;
  river: string;
  levelCm: number;
  changeCm: number;
  status: WaterStatus;
};

export interface WaterLevelProvider {
  getReading(): WaterLevelReading;
}
