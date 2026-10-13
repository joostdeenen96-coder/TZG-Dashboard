import type { WaterLevelProvider, WaterLevelReading } from "./waterLevelProvider.js";

export class KaubProvider implements WaterLevelProvider {
  getReading(): WaterLevelReading {
    return {
      id: "kaub",
      name: "Kaub",
      river: "Rijn",
      levelCm: 168,
      changeCm: -4,
      status: "laag",
    };
  }
}
