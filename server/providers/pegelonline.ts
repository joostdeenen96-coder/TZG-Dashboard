import { fetchJson } from "./http.js";
import { trendFromChange, type WaterStatus, type WaterTrend } from "./waterLevelProvider.js";

const PEGELONLINE_BASE = "https://www.pegelonline.wsv.de/webservices/rest-api/v2";
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_GAP_MS = 90 * 60 * 1000;

type Measurement = {
  timestamp: string;
  value: number;
};

export type PegelonlineReading = {
  levelCm: number;
  changeCm: number;
  trend: WaterTrend;
  status: WaterStatus;
  updatedAt: string;
};

function asObject(value: unknown, message: string) {
  if (!value || typeof value !== "object") throw new Error(message);
  return value as Record<string, unknown>;
}

function asMeasurements(value: unknown): Measurement[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Geen meetreeks voor de vorige dag.");
  }
  return value.map((item) => {
    const row = asObject(item, "Meetreeks is ongeldig.");
    if (typeof row.timestamp !== "string" || typeof row.value !== "number" || !Number.isFinite(row.value)) {
      throw new Error("Meetreeks is ongeldig.");
    }
    return { timestamp: row.timestamp, value: row.value };
  });
}

function statusFromState(state: unknown): WaterStatus {
  if (state === "low") return "laag";
  if (state === "normal") return "normaal";
  if (state === "high") return "hoog";
  throw new Error("Waterstandstatus ontbreekt.");
}

function valueOneDayEarlier(measurements: Measurement[], currentIso: string) {
  const current = Date.parse(currentIso);
  if (!Number.isFinite(current)) throw new Error("Tijdstip van de waterstand is ongeldig.");
  const target = current - DAY_MS;
  let best: Measurement | null = null;
  let bestGap = Number.POSITIVE_INFINITY;
  for (const measurement of measurements) {
    const gap = Math.abs(Date.parse(measurement.timestamp) - target);
    if (gap < bestGap) {
      best = measurement;
      bestGap = gap;
    }
  }
  if (!best || bestGap > MAX_GAP_MS) {
    throw new Error("Geen waterstand van ongeveer een dag eerder.");
  }
  return best.value;
}

export async function readPegelonlineWater(station: { uuid: string; shortname: string }): Promise<PegelonlineReading> {
  const seriesUrl = `${PEGELONLINE_BASE}/stations/${station.uuid}/W.json?includeCurrentMeasurement=true`;
  const historyUrl = `${PEGELONLINE_BASE}/stations/${station.uuid}/W/measurements.json?start=P2D`;
  const [seriesRaw, historyRaw] = await Promise.all([fetchJson(seriesUrl), fetchJson(historyUrl)]);
  const series = asObject(seriesRaw, `Tijdreeks ${station.shortname} is ongeldig.`);
  if (series.shortname !== "W" || series.unit !== "cm") {
    throw new Error("Waterstand staat niet in centimeter.");
  }
  const current = asObject(series.currentMeasurement, "Actuele waterstand ontbreekt.");
  if (typeof current.timestamp !== "string" || typeof current.value !== "number" || !Number.isFinite(current.value)) {
    throw new Error("Actuele waterstand is ongeldig.");
  }
  const previous = valueOneDayEarlier(asMeasurements(historyRaw), current.timestamp);
  const levelCm = Math.round(current.value);
  const changeCm = levelCm - Math.round(previous);
  return {
    levelCm,
    changeCm,
    trend: trendFromChange(changeCm),
    status: statusFromState(current.stateMnwMhw),
    updatedAt: current.timestamp,
  };
}
