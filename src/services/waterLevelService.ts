import { useSyncExternalStore } from "react";
import type { QueryState, WaterLevelReading } from "../types";

const WATER_LEVELS_PATH = "/api/waterlevels";

type WaterSnapshot = QueryState<WaterLevelReading[]>;

let snapshot: WaterSnapshot = { status: "loading" };
const listeners = new Set<() => void>();

function publish(next: WaterSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function loadWaterLevels() {
  let lastError = "Waterstanden niet bereikbaar.";
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const response = await fetch(WATER_LEVELS_PATH);
      if (!response.ok) {
        throw new Error(`Waterstanden antwoordden met ${response.status}.`);
      }
      const payload: unknown = await response.json();
      if (!Array.isArray(payload)) {
        throw new Error("Waterstanden hebben een ongeldig formaat.");
      }
      if (payload.length === 0) {
        publish({ status: "empty" });
        return;
      }
      publish({ status: "ready", data: payload as WaterLevelReading[] });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      await delay(200);
    }
  }
  publish({ status: "error", message: lastError });
}

void loadWaterLevels();

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
