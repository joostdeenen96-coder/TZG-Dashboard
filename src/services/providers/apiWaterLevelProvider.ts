import type { WaterLevelProvider, WaterLevelReading, WaterStationId, WaterStatus } from "../../types";

const PEGELONLINE_BASE = "https://www.pegelonline.wsv.de/webservices/rest-api/v2";

type GaugeStation = {
  id: WaterStationId;
  name: string;
  river: string;
  fuzzyId: string;
  laagBelowCm: number;
  hoogAboveCm: number;
};

type PegelMeasurement = {
  timestamp: string;
  value: number;
};

type PegelTimeseries = {
  shortname: string;
  currentMeasurement?: PegelMeasurement;
};

type PegelStationPayload = {
  uuid: string;
  shortname: string;
  timeseries?: PegelTimeseries[];
};

const stations: GaugeStation[] = [
  { id: "kaub", name: "Kaub", river: "Rijn", fuzzyId: "KAUB", laagBelowCm: 180, hoogAboveCm: 500 },
  { id: "ruhrort", name: "Ruhrort", river: "Rijn", fuzzyId: "RUHRORT", laagBelowCm: 200, hoogAboveCm: 500 },
  { id: "maxau", name: "Maxau", river: "Rijn", fuzzyId: "MAXAU", laagBelowCm: 350, hoogAboveCm: 700 },
];

function statusFor(levelCm: number, station: GaugeStation): WaterStatus {
  if (levelCm < station.laagBelowCm) return "laag";
  if (levelCm > station.hoogAboveCm) return "hoog";
  return "normaal";
}

export class ApiWaterLevelProvider implements WaterLevelProvider {
  readonly kind = "api" as const;
  private cache: WaterLevelReading[] = [];
  private readonly baseUrl: string;

  constructor(baseUrl = PEGELONLINE_BASE) {
    this.baseUrl = baseUrl;
  }

  getLevels() {
    return this.cache;
  }

  async loadLevels() {
    const readings = await Promise.all(stations.map((station) => this.readStation(station)));
    this.cache = readings;
    return readings;
  }

  private async readStation(station: GaugeStation): Promise<WaterLevelReading> {
    const listUrl = new URL(`${this.baseUrl}/stations.json`);
    listUrl.searchParams.set("fuzzyId", station.fuzzyId);
    listUrl.searchParams.set("includeTimeseries", "true");
    listUrl.searchParams.set("includeCurrentMeasurement", "true");

    const response = await fetch(listUrl);
    if (!response.ok) {
      throw new Error(`Peilbron ${station.fuzzyId} antwoordde met ${response.status}`);
    }

    const payload = (await response.json()) as PegelStationPayload[];
    const match =
      payload.find((item) => item.shortname.toUpperCase() === station.fuzzyId) ?? payload[0];
    const levelCm = match?.timeseries?.find((series) => series.shortname === "W")?.currentMeasurement
      ?.value;
    if (!match || levelCm == null) {
      throw new Error(`Geen waterstand voor ${station.fuzzyId}`);
    }

    const rounded = Math.round(levelCm);
    return {
      id: station.id,
      name: station.name,
      river: station.river,
      levelCm: rounded,
      changeCm: await this.readDailyChange(match.uuid, rounded),
      status: statusFor(rounded, station),
    };
  }

  private async readDailyChange(uuid: string, currentCm: number) {
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const url = new URL(`${this.baseUrl}/stations/${uuid}/W/measurements.json`);
    url.searchParams.set("start", start);
    const response = await fetch(url);
    if (!response.ok) return 0;
    const measurements = (await response.json()) as PegelMeasurement[];
    const earlier = measurements[0]?.value;
    if (earlier == null) return 0;
    return Math.round(currentCm - earlier);
  }
}
