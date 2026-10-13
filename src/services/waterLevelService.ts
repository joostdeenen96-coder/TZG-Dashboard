import { useSyncExternalStore } from "react";
import type { QueryState, WaterLevelsResponse, WaterStationId, WaterStationResult, WaterStatus, WaterTrend } from "../types";

const WATER_LEVELS_PATH = "/api/waterlevels";
const REFRESH_MS = 5 * 60 * 1000;

const stationNames: Record<WaterStationId, string> = {
  kaub: "Kaub",
  ruhrort: "Ruhrort",
  maxau: "Maxau",
};

type WaterSnapshot = QueryState<WaterLevelsResponse>;

let snapshot: WaterSnapshot = { status: "loading" };
const listeners = new Set<() => void>();
let refreshTimer = 0;

function publish(next: WaterSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isTrend(value: unknown): value is WaterTrend {
  return value === "stijgend" || value === "dalend" || value === "gelijk";
}

function isStatus(value: unknown): value is WaterStatus {
  return value === "laag" || value === "normaal" || value === "hoog";
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function failed(id: WaterStationId, message: string, row?: Record<string, unknown>): WaterStationResult {
  return {
    id,
    name: text(row?.name, stationNames[id]),
    river: text(row?.river, "Rijn"),
    levelCm: null,
    changeCm: null,
    trend: null,
    status: null,
    updatedAt: null,
    source: text(row?.source, ""),
    error: message,
  };
}

function normalizeStation(id: WaterStationId, value: unknown): WaterStationResult {
  if (!value || typeof value !== "object") return failed(id, "Peil niet beschikbaar.");
  const row = value as Record<string, unknown>;
  if (typeof row.error === "string" && row.error.trim()) return failed(id, row.error, row);
  if (
    typeof row.levelCm !== "number" ||
    typeof row.changeCm !== "number" ||
    !isTrend(row.trend) ||
    !isStatus(row.status) ||
    typeof row.updatedAt !== "string"
  ) {
    return failed(id, "Peil niet beschikbaar.", row);
  }
  return {
    id,
    name: text(row.name, stationNames[id]),
    river: text(row.river, "Rijn"),
    levelCm: row.levelCm,
    changeCm: row.changeCm,
    trend: row.trend,
    status: row.status,
    updatedAt: row.updatedAt,
    source: text(row.source, ""),
    error: null,
  };
}

function mapPayload(payload: unknown): WaterLevelsResponse | "empty" {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Waterstanden hebben een ongeldig formaat.");
  }
  const record = payload as Record<string, unknown>;
  if (Object.keys(record).length === 0) return "empty";
  if (!("kaub" in record) || !("ruhrort" in record) || !("maxau" in record)) {
    throw new Error("Waterstanden hebben een ongeldig formaat.");
  }
  return {
    kaub: normalizeStation("kaub", record.kaub),
    ruhrort: normalizeStation("ruhrort", record.ruhrort),
    maxau: normalizeStation("maxau", record.maxau),
  };
}

async function loadWaterLevels() {
  const keepReady = snapshot.status === "ready" ? snapshot : null;
  let lastError = "Waterstanden niet bereikbaar.";
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const response = await fetch(WATER_LEVELS_PATH);
      if (!response.ok) throw new Error(`Waterstanden antwoordden met ${response.status}.`);
      const mapped = mapPayload(await response.json());
      if (mapped === "empty") publish({ status: "empty" });
      else publish({ status: "ready", data: mapped });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      await delay(200);
    }
  }
  if (keepReady) publish(keepReady);
  else publish({ status: "error", message: lastError });
}

function ensureRefresh() {
  if (refreshTimer) return;
  refreshTimer = window.setInterval(() => {
    void loadWaterLevels();
  }, REFRESH_MS);
}

void loadWaterLevels();
ensureRefresh();

export function useWaterLevels() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => snapshot,
    () => snapshot,
  );
}
