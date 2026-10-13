import { readMaxauFromHvz } from "./hvzDataset.js";
import { failedStation, type WaterLevelProvider, type WaterStationResult } from "./waterLevelProvider.js";

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
      return {
        ...meta,
        ...reading,
        series: [],
        forecast: [],
        forecastError: null,
        graphPath: "/api/waterlevels/maxau/graph",
        error: null,
      };
    } catch (error) {
      return failedStation(meta, error);
    }
  }
}
