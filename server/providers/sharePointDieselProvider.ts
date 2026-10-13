import { getIntegrationSettings, sharePointGraphPath } from "../services/settingsService.js";
import type { DieselSurcharge, DieselSurchargeProvider, DieselWeek } from "./dieselSurchargeProvider.js";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

type GraphColumn = {
  name: string;
  displayName: string;
};

type FieldNames = {
  actief: string;
  peildatum: string;
  dieselPrijs: string;
  toeslagPercentage: string;
};

let tokenCache: (TokenCache & { key: string }) | null = null;

export function resetGraphCache() {
  tokenCache = null;
}

function graphCredentials() {
  const { graph } = getIntegrationSettings();
  if (!graph.tenantId || !graph.clientId || !graph.clientSecret) {
    throw new Error("Graph-gegevens ontbreken. Vul ze in via Instellingen.");
  }
  return graph;
}

function asObject(value: unknown, message: string) {
  if (!value || typeof value !== "object") throw new Error(message);
  return value as Record<string, unknown>;
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function graphError(response: Response) {
  const text = await response.text();
  try {
    const body = JSON.parse(text) as { error?: { code?: string; message?: string }; error_description?: string };
    const detail = body.error?.message || body.error?.code || body.error_description;
    if (detail) return `Graph antwoordde met ${response.status}: ${detail.slice(0, 180)}`;
  } catch {
    // De fouttekst blijft bij de statuscode.
  }
  return `Graph antwoordde met ${response.status}.`;
}

async function accessToken() {
  const graph = graphCredentials();
  const key = `${graph.tenantId}:${graph.clientId}:${graph.clientSecret}`;
  if (tokenCache && tokenCache.key === key && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.accessToken;
  const body = new URLSearchParams({
    client_id: graph.clientId,
    client_secret: graph.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  let response: Response;
  try {
    response = await fetch(`https://login.microsoftonline.com/${graph.tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new Error("Microsoft Graph-token is niet bereikbaar.");
  }
  if (!response.ok) throw new Error(await graphError(response));
  const payload = asObject(await response.json(), "Graph-token is ongeldig.");
  if (typeof payload.access_token !== "string" || typeof payload.expires_in !== "number") {
    throw new Error("Graph-token is ongeldig.");
  }
  tokenCache = {
    key,
    accessToken: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };
  return payload.access_token;
}

async function graphFetch(url: URL): Promise<unknown> {
  const token = await accessToken();
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new Error("Microsoft Graph is niet bereikbaar.");
  }
  if (!response.ok) throw new Error(await graphError(response));
  return response.json();
}

function graphUrl(path: string, query?: Record<string, string>) {
  const url = new URL(`${GRAPH_BASE}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  }
  return url;
}

async function graphList(url: URL) {
  const rows: Record<string, unknown>[] = [];
  let next: URL | null = url;
  for (let page = 0; page < 5 && next; page += 1) {
    const payload = asObject(await graphFetch(next), "Graph-lijst is ongeldig.");
    if (!Array.isArray(payload.value)) throw new Error("Graph-lijst is ongeldig.");
    for (const item of payload.value) rows.push(asObject(item, "Graph-item is ongeldig."));
    next = typeof payload["@odata.nextLink"] === "string" ? new URL(payload["@odata.nextLink"]) : null;
    if (next && next.origin !== "https://graph.microsoft.com") {
      throw new Error("Onverwachte Graph-vervolgkoppeling.");
    }
  }
  return rows;
}

function columnName(columns: GraphColumn[], keys: string[]) {
  for (const key of keys) {
    const found = columns.find(
      (column) => normalizeName(column.displayName) === key || normalizeName(column.name) === key,
    );
    if (found) return found.name;
  }
  throw new Error(`Kolom ${keys[0]} ontbreekt in de lijst.`);
}

function readNumber(value: unknown, label: string) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value.replace(",", ".")) : Number.NaN;
  if (!Number.isFinite(number)) throw new Error(`${label} is geen getal.`);
  return number;
}

function readBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true" || value === "Ja") return true;
  if (value === 0 || value === "0" || value === "false" || value === "Nee") return false;
  throw new Error("Actief is ongeldig.");
}

function readPeildatum(value: unknown) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Peildatum ontbreekt.");
  return value;
}

function toSurcharge(fields: Record<string, unknown>, names: FieldNames): DieselWeek {
  return {
    peildatum: readPeildatum(fields[names.peildatum]),
    dieselPrijs: readNumber(fields[names.dieselPrijs], "Dieselprijs"),
    toeslagPercentage: readNumber(fields[names.toeslagPercentage], "Toeslagpercentage"),
    actief: readBoolean(fields[names.actief]),
  };
}

function isoWeekKey(peildatum: string) {
  const time = Date.parse(peildatum);
  if (!Number.isFinite(time)) return peildatum;
  const date = new Date(time);
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function mapRecords(items: Record<string, unknown>[], names: FieldNames) {
  const records: DieselWeek[] = [];
  for (const item of items) {
    try {
      records.push(toSurcharge(asObject(item.fields, "Velden van het dieselrecord ontbreken."), names));
    } catch (error) {
      const message = error instanceof Error ? error.message : "record overgeslagen";
      console.error(`Dieselrecord overgeslagen (${message}).`);
    }
  }
  return records;
}

function pickActive(records: DieselWeek[]) {
  const active = records.filter((record) => record.actief);
  if (active.length === 0) throw new Error("Geen record met Actief = true.");
  active.sort((left, right) => Date.parse(right.peildatum) - Date.parse(left.peildatum));
  return active[0];
}

function latestFiveWeeks(records: DieselWeek[]) {
  const byWeek = new Map<string, DieselWeek>();
  const chronological = [...records].sort((left, right) => Date.parse(left.peildatum) - Date.parse(right.peildatum));
  for (const record of chronological) {
    if (!Number.isFinite(Date.parse(record.peildatum))) continue;
    byWeek.set(isoWeekKey(record.peildatum), record);
  }
  return [...byWeek.values()]
    .sort((left, right) => Date.parse(right.peildatum) - Date.parse(left.peildatum))
    .slice(0, 5)
    .sort((left, right) => Date.parse(left.peildatum) - Date.parse(right.peildatum));
}

function withWeeks(active: DieselWeek, records: DieselWeek[]): DieselSurcharge {
  const weken = latestFiveWeeks(records);
  return { ...active, weken: weken.length > 0 ? weken : [{ ...active }] };
}

async function openActiveList() {
  const { sharepoint } = getIntegrationSettings();
  const site = asObject(await graphFetch(graphUrl(sharePointGraphPath(sharepoint.siteUrl))), "SharePoint-site is ongeldig.");
  if (typeof site.id !== "string") throw new Error("SharePoint-site niet gevonden.");
  const lists = await graphList(
    graphUrl(`/sites/${site.id}/lists`, {
      $select: "id,displayName",
      $filter: `displayName eq '${sharepoint.listName}'`,
    }),
  );
  const list = lists.find((item) => item.displayName === sharepoint.listName);
  if (!list || typeof list.id !== "string") throw new Error(`Lijst ${sharepoint.listName} niet gevonden.`);
  return { siteId: site.id, listId: list.id, listName: sharepoint.listName };
}

export async function testSharePointConnection() {
  const { siteId, listName } = await openActiveList();
  return `Verbonden met ${listName} op site ${siteId.split(",")[0] ?? siteId}.`;
}

export class SharePointDieselProvider implements DieselSurchargeProvider {
  async getCurrentData(): Promise<DieselSurcharge> {
    const { siteId, listId, listName } = await openActiveList();
    const site = { id: siteId };
    const list = { id: listId };

    const columns = (await graphList(
      graphUrl(`/sites/${site.id}/lists/${list.id}/columns`, { $select: "name,displayName", $top: "200" }),
    ))
      .filter((column): column is GraphColumn => typeof column.name === "string" && typeof column.displayName === "string");
    const names: FieldNames = {
      actief: columnName(columns, ["actief"]),
      peildatum: columnName(columns, ["peildatum"]),
      dieselPrijs: columnName(columns, ["dieselprijs", "gasolieprijs"]),
      toeslagPercentage: columnName(columns, ["toeslagpercentage", "toeslag"]),
    };

    const itemQuery = {
      $expand: "fields",
      $top: "100",
    };
    let items: Record<string, unknown>[];
    try {
      items = await graphList(
        graphUrl(`/sites/${site.id}/lists/${list.id}/items`, {
          ...itemQuery,
          $orderby: `fields/${names.peildatum} desc`,
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "sortering mislukt";
      console.error(`Sortering op ${listName} mislukt (${message}). Items worden lokaal gesorteerd.`);
      items = await graphList(graphUrl(`/sites/${site.id}/lists/${list.id}/items`, itemQuery));
    }

    const records = mapRecords(items, names);
    const record = withWeeks(pickActive(records), records);
    console.info(
      `Actief dieselrecord uit SharePoint, peildatum ${record.peildatum}, ${record.weken.length} weekregels.`,
    );
    return record;
  }
}
