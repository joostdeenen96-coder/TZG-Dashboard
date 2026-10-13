import { readMaxauFromHvz } from "./hvzDataset.js";
import { readPegelonlineChart } from "./pegelonline.js";
import { failedStation, type WaterLevelProvider, type WaterStationResult } from "./waterLevelProvider.js";

const MAXAU_PEGEL_UUID = "b6c6d5c8-e2d5-4469-8dd8-fa972ef7eaea";

const meta = {
  id: "maxau" as const,
  name: "Maxau",
  river: "Rijn",
  source: "HVZ Baden-Württemberg",
};

export class MaxauProvider implements WaterLevelProvider {
  async getCurrentData(): Promise<WaterStationResult> {
    try {
      const reading = await readMaxauFromHvz();
      const chart = await readPegelonlineChart(MAXAU_PEGEL_UUID).catch(() => null);
      return {
        ...meta,
        ...reading,
        series: chart?.series ?? [],
        forecast: [],
        forecastError: null,
        graphPath: null,
        error: null,
      };
    } catch (error) {
      return failedStation(meta, error);
    }
  }
}
