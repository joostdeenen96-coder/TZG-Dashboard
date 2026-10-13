import type { WaterLevelProvider, WaterLevelReading } from "./waterLevelProvider.js";

export class MaxauProvider implements WaterLevelProvider {
  getReading(): WaterLevelReading {
    return {
      id: "maxau",
      name: "Maxau",
      river: "Rijn",
      levelCm: 512,
      changeCm: -11,
      status: "normaal",
    };
  }
}
