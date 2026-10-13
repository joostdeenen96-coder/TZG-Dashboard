import {
  WATER_LEVEL_UPDATED_AT,
  type WaterLevelProvider,
  type WaterLevelReading,
} from "./waterLevelProvider.js";

export class KaubProvider implements WaterLevelProvider {
  getReading(): WaterLevelReading {
    return {
      id: "kaub",
      name: "Kaub",
      river: "Rijn",
      levelCm: 168,
      changeCm: -4,
      trend: "dalend",
      status: "laag",
      updatedAt: WATER_LEVEL_UPDATED_AT,
    };
  }
}
