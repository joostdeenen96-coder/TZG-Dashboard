import { useSyncExternalStore } from "react";
import type { WaterLevelReading } from "../types";

const WATER_LEVELS_PATH = "/api/waterlevels";

let snapshot: WaterLevelReading[] = [];
const listeners = new Set<() => void>();

function publish(next: WaterLevelReading[]) {
  snapshot = next;
  for (const listener of listeners) listener();
}

async function loadWaterLevels() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(WATER_LEVELS_PATH);
      if (!response.ok) {
        throw new Error(`Waterstanden antwoordden met ${response.status}`);
      }
      publish((await response.json()) as WaterLevelReading[]);
      return;
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }
  }
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
