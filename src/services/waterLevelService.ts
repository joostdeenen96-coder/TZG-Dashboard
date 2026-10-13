import { useSyncExternalStore } from "react";
import type { WaterLevelProvider, WaterLevelProviderKind, WaterLevelReading } from "../types";
import { ApiWaterLevelProvider } from "./providers/apiWaterLevelProvider";
import { MockDataWaterLevelProvider } from "./providers/mockDataWaterLevelProvider";
import { SharePointWaterLevelProvider } from "./providers/sharePointWaterLevelProvider";

/** Actieve bron. Enige plek om van provider te wisselen. */
export const waterLevelProviderKind: WaterLevelProviderKind = "mock";

function createWaterLevelProvider(kind: WaterLevelProviderKind): WaterLevelProvider {
  switch (kind) {
    case "mock":
      return new MockDataWaterLevelProvider();
    case "api":
      return new ApiWaterLevelProvider();
    case "sharepoint":
      return new SharePointWaterLevelProvider();
  }
}

const provider = createWaterLevelProvider(waterLevelProviderKind);

let snapshot: WaterLevelReading[] = provider.getLevels();
const listeners = new Set<() => void>();

function publish(next: WaterLevelReading[]) {
  snapshot = next;
  for (const listener of listeners) listener();
}

void provider.loadLevels().then(
  (levels) => {
    if (levels !== snapshot) publish(levels);
  },
  () => {
    // Een niet-gekoppelde provider laat de laatste snapshot staan.
  },
);

export function getWaterLevels() {
  return snapshot;
}

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
