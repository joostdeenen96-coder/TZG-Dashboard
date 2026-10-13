import { useSyncExternalStore } from "react";
import type { DieselSurcharge, QueryState, WaterTrend } from "../types";

const DIESEL_PATH = "/api/dieselsurcharge";
const REFRESH_MS = 5 * 60 * 1000;

type DieselSnapshot = QueryState<DieselSurcharge>;

let snapshot: DieselSnapshot = { status: "loading" };
const listeners = new Set<() => void>();
let refreshTimer = 0;

function publish(next: DieselSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isTrend(value: unknown): value is WaterTrend {
  return value === "stijgend" || value === "dalend" || value === "gelijk";
}

function mapPayload(payload: unknown): DieselSurcharge | "empty" {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Dieseltoeslag heeft een ongeldig formaat.");
  }
  const row = payload as Record<string, unknown>;
  if (typeof row.error === "string" && row.error.trim()) throw new Error(row.error);
  if (Object.keys(row).length === 0) return "empty";
  if (
    typeof row.percentage !== "number" ||
    typeof row.periodLabel !== "string" ||
    typeof row.note !== "string" ||
    !isTrend(row.trend) ||
    typeof row.changePoints !== "number" ||
    typeof row.status !== "string" ||
    typeof row.updatedAt !== "string"
  ) {
    throw new Error("Dieseltoeslag heeft een ongeldig formaat.");
  }
  return {
    percentage: row.percentage,
    periodLabel: row.periodLabel,
    note: row.note,
    trend: row.trend,
    changePoints: row.changePoints,
    status: row.status,
    updatedAt: row.updatedAt,
  };
}

async function loadDiesel() {
  const keepReady = snapshot.status === "ready" ? snapshot : null;
  let lastError = "Dieseltoeslag niet bereikbaar.";
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const response = await fetch(DIESEL_PATH);
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : `Dieseltoeslag antwoordde met ${response.status}.`;
        throw new Error(message);
      }
      const mapped = mapPayload(payload);
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
    void loadDiesel();
  }, REFRESH_MS);
}

void loadDiesel();
ensureRefresh();

export function useDieselSurcharge() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => snapshot,
    () => snapshot,
  );
}
