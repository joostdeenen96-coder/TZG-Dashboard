import type { DieselSurcharge, DieselSurchargeProvider } from "./dieselSurchargeProvider.js";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const SITE_PATH = "/sites/teunesen.sharepoint.com:/sites/Facturatie";
const LIST_NAME = "Dieseltoeslagen Asvervoer";

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

let tokenCache: TokenCache | null = null;

function envValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ontbreekt.`);
  return value;
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
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.accessToken;
  const body = new URLSearchParams({
    client_id: envValue("GRAPH_CLIENT_ID"),
    client_secret: envValue("GRAPH_CLIENT_SECRET"),
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  let response: Response;
  try {
    response = await fetch(`https://login.microsoftonline.com/${envValue("GRAPH_TENANT_ID")}/oauth2/v2.0/token`, {
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
  throw new Error(`Kolom ${keys[0]} ontbreekt in ${LIST_NAME}.`);
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

function toSurcharge(fields: Record<string, unknown>, names: FieldNames): DieselSurcharge {
  return {
    peildatum: readPeildatum(fields[names.peildatum]),
    dieselPrijs: readNumber(fields[names.dieselPrijs], "Dieselprijs"),
    toeslagPercentage: readNumber(fields[names.toeslagPercentage], "Toeslagpercentage"),
    actief: readBoolean(fields[names.actief]),
  };
}

function pickActive(items: Record<string, unknown>[], names: FieldNames) {
  const active = items
    .map((item) => toSurcharge(asObject(item.fields, "Velden van het dieselrecord ontbreken."), names))
    .filter((record) => record.actief);
  if (active.length === 0) throw new Error("Geen record met Actief = true.");
  active.sort((left, right) => Date.parse(right.peildatum) - Date.parse(left.peildatum));
  return active[0];
}

export class SharePointDieselProvider implements DieselSurchargeProvider {
  async getCurrentData(): Promise<DieselSurcharge> {
    const site = asObject(await graphFetch(graphUrl(SITE_PATH)), "SharePoint-site is ongeldig.");
    if (typeof site.id !== "string") throw new Error("SharePoint-site niet gevonden.");
    const lists = await graphList(
      graphUrl(`/sites/${site.id}/lists`, {
        $select: "id,displayName",
        $filter: `displayName eq '${LIST_NAME}'`,
      }),
    );
    const list = lists.find((item) => item.displayName === LIST_NAME);
    if (!list || typeof list.id !== "string") throw new Error(`Lijst ${LIST_NAME} niet gevonden.`);

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

    const filtered = graphUrl(`/sites/${site.id}/lists/${list.id}/items`, {
      $expand: "fields",
      $top: "100",
      $filter: `fields/${names.actief} eq true`,
    });
    let items: Record<string, unknown>[];
    try {
      items = await graphList(filtered);
    } catch (error) {
      const message = error instanceof Error ? error.message : "filter mislukt";
      console.error(`Actief-filter op ${LIST_NAME} mislukt (${message}). Alle items worden lokaal gefilterd.`);
      items = await graphList(
        graphUrl(`/sites/${site.id}/lists/${list.id}/items`, { $expand: "fields", $top: "100" }),
      );
    }

    const record = pickActive(items, names);
    console.info(`Actief dieselrecord uit SharePoint, peildatum ${record.peildatum}.`);
    return record;
  }
}
