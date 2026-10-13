import { useSyncExternalStore } from "react";
import type { QueryState, WijNewsItem, WijNewsResponse } from "../types";

const NEWS_PATH = "/api/news";
const REFRESH_MS = 5 * 60 * 1000;

type NewsSnapshot = QueryState<WijNewsResponse>;

let snapshot: NewsSnapshot = { status: "loading" };
const listeners = new Set<() => void>();
let refreshTimer = 0;

function publish(next: NewsSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function items(value: unknown): WijNewsItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const id = text(row.id);
    const title = text(row.title);
    const publishedAt = text(row.publishedAt);
    if (!id || !title || !publishedAt) return [];
    return [{ id, title, summary: text(row.summary), publishedAt }];
  });
}

function mapPayload(payload: unknown): WijNewsResponse {
  if (!payload || typeof payload !== "object") throw new Error("Nieuws heeft een ongeldig formaat.");
  const row = payload as Record<string, unknown>;
  if (row.source !== "WijTeunesen") throw new Error("Nieuws komt niet van WijTeunesen.");
  return {
    site: text(row.site) || "https://teunesen.sharepoint.com/sites/wt-nieuws",
    source: "WijTeunesen",
    connected: row.connected === true,
    items: items(row.items),
    error: text(row.error) || null,
  };
}

async function loadNews() {
  const keepReady = snapshot.status === "ready" ? snapshot : null;
  let lastError = "WijTeunesen-nieuws niet bereikbaar.";
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const response = await fetch(NEWS_PATH);
      if (!response.ok) throw new Error(`Nieuws antwoordde met ${response.status}.`);
      publish({ status: "ready", data: mapPayload(await response.json()) });
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
    void loadNews();
  }, REFRESH_MS);
}

void loadNews();
ensureRefresh();

export function useWijNews() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => snapshot,
    () => snapshot,
  );
}
