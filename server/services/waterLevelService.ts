import type { WaterLevelReading } from "../providers/waterLevelProvider.js";
import { KaubProvider } from "../providers/kaubProvider.js";
import { MaxauProvider } from "../providers/maxauProvider.js";
import { RuhrortProvider } from "../providers/ruhrortProvider.js";

const providers = [new KaubProvider(), new RuhrortProvider(), new MaxauProvider()];

export function getWaterLevels(): WaterLevelReading[] {
  return providers.map((provider) => provider.getReading());
}
