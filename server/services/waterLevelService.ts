import { KaubProvider } from "../providers/kaubProvider.js";
import { MaxauProvider } from "../providers/maxauProvider.js";
import { RuhrortProvider } from "../providers/ruhrortProvider.js";
import {
  failedStation,
  type WaterLevelProvider,
  type WaterLevelsResponse,
  type WaterStationId,
} from "../providers/waterLevelProvider.js";

const stationMeta = {
  kaub: { id: "kaub", name: "Kaub", river: "Rijn", source: "PEGELONLINE" },
  ruhrort: { id: "ruhrort", name: "Ruhrort", river: "Rijn", source: "PEGELONLINE" },
  maxau: { id: "maxau", name: "Maxau", river: "Rijn", source: "HVZ Baden-Württemberg" },
} as const;

const providers: Record<WaterStationId, WaterLevelProvider> = {
  kaub: new KaubProvider(),
  ruhrort: new RuhrortProvider(),
  maxau: new MaxauProvider(),
};

export async function getWaterLevels(): Promise<WaterLevelsResponse> {
  const ids = Object.keys(providers) as WaterStationId[];
  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        return [id, await providers[id].getCurrentData()] as const;
      } catch (error) {
        return [id, failedStation(stationMeta[id], error)] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as WaterLevelsResponse;
}
