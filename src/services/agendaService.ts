import { useSyncExternalStore } from "react";
import type { WijAgendaItem, WijAgendaResponse } from "../types";
import { createPollingFeed } from "./tvFeed";

const AGENDA_PATH = "/api/agenda?versie=2";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function items(value: unknown): WijAgendaItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const id = text(row.id);
    const title = text(row.title);
    const startsAt = text(row.startsAt);
    const endsAt = text(row.endsAt) || startsAt;
    if (!id || !title || !startsAt) return [];
    return [{ id, title, location: text(row.location), startsAt, endsAt, allDay: row.allDay === true }];
  });
}

function mapPayload(payload: unknown): WijAgendaResponse {
  if (!payload || typeof payload !== "object") throw new Error("Agenda heeft een ongeldig formaat.");
  const row = payload as Record<string, unknown>;
  if (row.source !== "WijTeunesen") throw new Error("Agenda komt niet van WijTeunesen.");
  return {
    site: text(row.site) || "https://teunesen.sharepoint.com/sites/HR-NL",
    source: "WijTeunesen",
    connected: row.connected === true,
    items: items(row.items).slice(0, 8),
    error: text(row.error) || null,
  };
}

async function loadAgenda(signal: AbortSignal): Promise<WijAgendaResponse | "empty"> {
  const response = await fetch(AGENDA_PATH, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`Agenda antwoordde met ${response.status}.`);
  return mapPayload(await response.json());
}

function acceptAgenda(value: unknown): WijAgendaResponse | null {
  try {
    return mapPayload(value);
  } catch {
    return null;
  }
}

const agendaFeed = createPollingFeed<WijAgendaResponse>({
  name: "agenda",
  storageKey: "teunesen.tv.agenda.v1",
  unavailable: "WijTeunesen-agenda niet bereikbaar.",
  load: loadAgenda,
  accept: acceptAgenda,
});

export function useWijAgenda() {
  return useSyncExternalStore(agendaFeed.subscribe, agendaFeed.getSnapshot, agendaFeed.getSnapshot);
}
