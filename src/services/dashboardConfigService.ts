import { useSyncExternalStore } from "react";

export type ScreenConfig = {
  weer: { plaatsnaam: string };
  dashboard: { refreshInterval: number; aantalNieuwsitems: number };
};

const fallback: ScreenConfig = {
  weer: { plaatsnaam: "Gennep" },
  dashboard: { refreshInterval: 300, aantalNieuwsitems: 3 },
};

let screen: ScreenConfig = fallback;
const listeners = new Set<() => void>();

function publish(next: ScreenConfig) {
  screen = next;
  for (const listener of listeners) listener();
}

function mapConfig(value: unknown): ScreenConfig | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const weer = row.weer;
  const dashboard = row.dashboard;
  if (!weer || typeof weer !== "object" || !dashboard || typeof dashboard !== "object") return null;
  const plaatsnaam = (weer as Record<string, unknown>).plaatsnaam;
  const refreshInterval = (dashboard as Record<string, unknown>).refreshInterval;
  const aantalNieuwsitems = (dashboard as Record<string, unknown>).aantalNieuwsitems;
  if (typeof plaatsnaam !== "string" || !plaatsnaam.trim()) return null;
  if (typeof refreshInterval !== "number" || typeof aantalNieuwsitems !== "number") return null;
  return {
    weer: { plaatsnaam: plaatsnaam.trim() },
    dashboard: { refreshInterval, aantalNieuwsitems },
  };
}

async function loadScreenConfig() {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) return;
    const mapped = mapConfig(await response.json());
    if (mapped) publish(mapped);
  } catch {
    // Het scherm houdt de laatste bekende instellingen.
  }
}

export function getRefreshMs() {
  return screen.dashboard.refreshInterval * 1000;
}

export function useScreenConfig() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => screen,
    () => fallback,
  );
}

void loadScreenConfig();
window.setInterval(() => {
  void loadScreenConfig();
}, 30_000);
