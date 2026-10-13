import {
  WATER_LEVEL_UPDATED_AT,
  type WaterLevelProvider,
  type WaterLevelReading,
} from "./waterLevelProvider.js";

export class MaxauProvider implements WaterLevelProvider {
  getReading(): WaterLevelReading {
    return {
      id: "maxau",
      name: "Maxau",
      river: "Rijn",
      levelCm: 512,
      changeCm: -11,
      trend: "dalend",
      status: "normaal",
      updatedAt: WATER_LEVEL_UPDATED_AT,
    };
  }
}
