import { graphGet, graphUrl } from "../services/graphClient.js";
import { sharePointGraphPath } from "../services/settingsService.js";

export type WijAgendaItem = {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
};

const SITE_URL = "https://teunesen.sharepoint.com/sites/HR-NL";
const LIST_NAME = "Gebeurtenissen";
const AGENDA_LIMIT = 8;

function asObject(value: unknown, message: string) {
  if (!value || typeof value !== "object") throw new Error(message);
  return value as Record<string, unknown>;
}

function textField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isAllDay(value: unknown) {
  return value === true || value === "true";
}

function amsterdamDay(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}`;
}

function dayKey(iso: string, allDay: boolean) {
  if (allDay) return iso.slice(0, 10);
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  return amsterdamDay(new Date(time));
}

function nextGraphLink(payload: Record<string, unknown>) {
  if (typeof payload["@odata.nextLink"] !== "string") return null;
  const next = new URL(payload["@odata.nextLink"]);
  if (next.origin !== "https://graph.microsoft.com") throw new Error("Onverwachte Graph-vervolgkoppeling.");
  return next;
}

async function openAgendaList() {
  const site = asObject(await graphGet(graphUrl(sharePointGraphPath(SITE_URL))), "Agendasite is ongeldig.");
  if (typeof site.id !== "string") throw new Error("Agendasite niet gevonden.");
  const payload = asObject(
    await graphGet(
      graphUrl(`/sites/${site.id}/lists`, {
        $select: "id,displayName",
        $filter: "displayName eq 'Gebeurtenissen'",
      }),
    ),
    "Agendalijst is ongeldig.",
  );
  if (!Array.isArray(payload.value)) throw new Error("Agendalijst is ongeldig.");
  const list = payload.value
    .map((item) => asObject(item, "Agendalijst is ongeldig."))
    .find((item) => item.displayName === LIST_NAME);
  if (!list || typeof list.id !== "string") throw new Error("Agendalijst Gebeurtenissen niet gevonden.");
  return { siteId: site.id, listId: list.id };
}

export async function readWijAgenda(): Promise<WijAgendaItem[]> {
  const list = await openAgendaList();
  const rows: WijAgendaItem[] = [];
  let next: URL | null = graphUrl(`/sites/${list.siteId}/lists/${list.listId}/items`, {
    $expand: "fields($select=Title,Location,EventDate,EndDate,fAllDayEvent)",
    $top: "50",
  });
  for (let page = 0; page < 4 && next; page += 1) {
    const payload = asObject(await graphGet(next), "Agenda-items zijn ongeldig.");
    if (!Array.isArray(payload.value)) throw new Error("Agenda-items zijn ongeldig.");
    for (const item of payload.value) {
      const row = asObject(item, "Agenda-item is ongeldig.");
      const fields = asObject(row.fields, "Agenda-item mist velden.");
      const title = textField(fields.Title);
      const startsAt = textField(fields.EventDate);
      const endsAt = textField(fields.EndDate) || startsAt;
      const id = textField(row.id);
      if (!id || !title || !startsAt) continue;
      rows.push({
        id,
        title,
        location: textField(fields.Location),
        startsAt,
        endsAt,
        allDay: isAllDay(fields.fAllDayEvent),
      });
    }
    next = nextGraphLink(payload);
  }
  const today = amsterdamDay(new Date());
  return rows
    .filter((item) => {
      const end = dayKey(item.endsAt, item.allDay);
      return end >= today;
    })
    .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt))
    .slice(0, AGENDA_LIMIT);
}

export function currentAgendaSite() {
  return SITE_URL;
}
