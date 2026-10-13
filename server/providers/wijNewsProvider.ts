import { getIntegrationSettings, sharePointGraphPath } from "../services/settingsService.js";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const NEWS_SITE = "https://teunesen.sharepoint.com/sites/wt-nieuws";
const SITE_PATH = "/sites/wt-nieuws";

export type WijNewsItem = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
};

type TokenCache = {
  key: string;
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

export function resetWijNewsCache() {
  tokenCache = null;
}

function asObject(value: unknown, message: string) {
  if (!value || typeof value !== "object") throw new Error(message);
  return value as Record<string, unknown>;
}

async function graphError(response: Response) {
  const text = await response.text();
  try {
    const body = JSON.parse(text) as { error?: { code?: string; message?: string }; error_description?: string };
    const detail = body.error?.message || body.error?.code || body.error_description;
    if (detail) return `Graph antwoordde met ${response.status}: ${detail.slice(0, 180)}`;
  } catch {
    // De statuscode blijft de fout.
  }
  return `Graph antwoordde met ${response.status}.`;
}

async function accessToken() {
  const { graph } = getIntegrationSettings();
  if (!graph.tenantId || !graph.clientId || !graph.clientSecret) {
    throw new Error("Graph-gegevens ontbreken. Vul ze in via Instellingen.");
  }
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
  tokenCache = { key, accessToken: payload.access_token, expiresAt: Date.now() + payload.expires_in * 1000 };
  return payload.access_token;
}

async function graphFetch(url: URL): Promise<unknown> {
  const token = await accessToken();
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
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
  for (let page = 0; page < 4 && next; page += 1) {
    const payload = asObject(await graphFetch(next), "Nieuwspagina's zijn ongeldig.");
    if (!Array.isArray(payload.value)) throw new Error("Nieuwspagina's zijn ongeldig.");
    for (const item of payload.value) rows.push(asObject(item, "Nieuwspagina is ongeldig."));
    next = typeof payload["@odata.nextLink"] === "string" ? new URL(payload["@odata.nextLink"]) : null;
    if (next && next.origin !== "https://graph.microsoft.com") throw new Error("Onverwachte Graph-vervolgkoppeling.");
  }
  return rows;
}

function plainText(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function isWijNews(item: Record<string, unknown>) {
  if (item.promotionKind !== "newsPost") return false;
  if (typeof item.title !== "string" || !item.title.trim()) return false;
  if (typeof item.webUrl === "string") {
    try {
      const url = new URL(item.webUrl);
      if (url.hostname !== "teunesen.sharepoint.com") return false;
      if (!url.pathname.toLowerCase().startsWith(SITE_PATH)) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function toItem(item: Record<string, unknown>): WijNewsItem {
  const published = typeof item.createdDateTime === "string" ? item.createdDateTime : item.lastModifiedDateTime;
  if (typeof item.id !== "string" || typeof item.title !== "string" || typeof published !== "string") {
    throw new Error("Nieuwspagina mist titel of datum.");
  }
  return {
    id: item.id,
    title: item.title.trim(),
    summary: plainText(item.description) || plainText(item.title),
    publishedAt: published,
  };
}

export async function readWijNews(): Promise<WijNewsItem[]> {
  const site = asObject(await graphFetch(graphUrl(sharePointGraphPath(NEWS_SITE))), "WijTeunesen-site is ongeldig.");
  if (typeof site.id !== "string") throw new Error("WijTeunesen-site niet gevonden.");
  let pages: Record<string, unknown>[];
  try {
    pages = await graphList(
      graphUrl(`/sites/${site.id}/pages`, { $top: "25", $orderby: "lastModifiedDateTime desc" }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "sortering mislukt";
    console.error(`Sortering van WijTeunesen-pagina's mislukt (${message}).`);
    pages = await graphList(graphUrl(`/sites/${site.id}/pages`, { $top: "25" }));
  }
  return pages
    .filter(isWijNews)
    .map(toItem)
    .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
    .slice(0, 5);
}

export const wijNewsSite = NEWS_SITE;
