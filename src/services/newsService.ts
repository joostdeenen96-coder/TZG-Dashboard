import { useSyncExternalStore } from "react";
import type { WijNewsItem, WijNewsResponse } from "../types";

import { createPollingFeed } from "./tvFeed";

const NEWS_PATH = "/api/news";

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
    const expectedImage = `/api/news/${encodeURIComponent(id)}/image`;
    const imagePath = row.imagePath === expectedImage ? expectedImage : null;
    return [{ id, title, summary: text(row.summary), publishedAt, imagePath }];
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

async function loadNews(signal: AbortSignal): Promise<WijNewsResponse | "empty"> {
  const response = await fetch(NEWS_PATH, { signal });
  if (!response.ok) throw new Error(`Nieuws antwoordde met ${response.status}.`);
  return mapPayload(await response.json());
}

function acceptNews(value: unknown): WijNewsResponse | null {
  try {
    return mapPayload(value);
  } catch {
    return null;
  }
}

const newsFeed = createPollingFeed<WijNewsResponse>({
  name: "nieuws",
  storageKey: "teunesen.tv.news.v2",
  unavailable: "WijTeunesen-nieuws niet bereikbaar.",
  load: loadNews,
  accept: acceptNews,
});

export function useWijNews() {
  return useSyncExternalStore(newsFeed.subscribe, newsFeed.getSnapshot, newsFeed.getSnapshot);
}
