import {
  WATER_LEVEL_UPDATED_AT,
  type WaterLevelProvider,
  type WaterLevelReading,
} from "./waterLevelProvider.js";

export class RuhrortProvider implements WaterLevelProvider {
  getReading(): WaterLevelReading {
    return {
      id: "ruhrort",
      name: "Ruhrort",
      river: "Rijn",
      levelCm: 286,
      changeCm: 3,
      trend: "stijgend",
      status: "normaal",
      updatedAt: WATER_LEVEL_UPDATED_AT,
    };
  }
}
