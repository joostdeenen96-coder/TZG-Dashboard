import type { WaterLevelProvider, WaterLevelReading } from "./waterLevelProvider.js";

export class RuhrortProvider implements WaterLevelProvider {
  getReading(): WaterLevelReading {
    return {
      id: "ruhrort",
      name: "Ruhrort",
      river: "Rijn",
      levelCm: 286,
      changeCm: 3,
      status: "normaal",
    };
  }
}
