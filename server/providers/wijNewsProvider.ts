import { getDashboardConfig } from "../services/dashboardConfig.js";
import { graphGet, graphUrl, resetGraphCache } from "../services/graphClient.js";
import { sharePointGraphPath } from "../services/settingsService.js";

export type WijNewsItem = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
};

export function resetWijNewsCache() {
  resetGraphCache();
}

function asObject(value: unknown, message: string) {
  if (!value || typeof value !== "object") throw new Error(message);
  return value as Record<string, unknown>;
}

async function graphList(url: URL) {
  const rows: Record<string, unknown>[] = [];
  let next: URL | null = url;
  for (let page = 0; page < 4 && next; page += 1) {
    const payload = asObject(await graphGet(next), "Nieuwspagina's zijn ongeldig.");
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

function odataText(value: string) {
  return value.replaceAll("'", "''");
}

function isWijNews(item: Record<string, unknown>, siteUrl: string) {
  if (item.promotionKind !== "newsPost") return false;
  if (typeof item.title !== "string" || !item.title.trim()) return false;
  const sitePath = new URL(siteUrl).pathname.replace(/\/$/, "").toLowerCase();
  if (typeof item.webUrl === "string") {
    try {
      const url = new URL(item.webUrl);
      if (url.hostname !== new URL(siteUrl).hostname) return false;
      if (!url.pathname.toLowerCase().startsWith(sitePath)) return false;
    } catch {
      return false;
    }
  }
  return true;
}

async function openNewsLibrary(siteUrl: string, bibliotheek: string) {
  const site = asObject(await graphGet(graphUrl(sharePointGraphPath(siteUrl))), "Nieuwssite is ongeldig.");
  if (typeof site.id !== "string") throw new Error("Nieuwssite niet gevonden.");
  const lists = await graphList(
    graphUrl(`/sites/${site.id}/lists`, {
      $select: "id,displayName",
      $filter: `displayName eq '${odataText(bibliotheek)}'`,
    }),
  );
  const library = lists.find((item) => item.displayName === bibliotheek);
  if (!library || typeof library.id !== "string") throw new Error(`Bibliotheek ${bibliotheek} niet gevonden.`);
  return { siteId: site.id, libraryName: bibliotheek };
}

export async function testNewsLibrary(siteUrl?: string, bibliotheek?: string) {
  const config = getDashboardConfig();
  const found = await openNewsLibrary(
    siteUrl ?? config.sharepointNieuws.siteUrl,
    bibliotheek ?? config.sharepointNieuws.bibliotheek,
  );
  return `Nieuws: bibliotheek ${found.libraryName} gevonden.`;
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
  const config = getDashboardConfig();
  const siteUrl = config.sharepointNieuws.siteUrl;
  const site = asObject(await graphGet(graphUrl(sharePointGraphPath(siteUrl))), "WijTeunesen-site is ongeldig.");
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
    .filter((item) => isWijNews(item, siteUrl))
    .map(toItem)
    .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
    .slice(0, config.dashboard.aantalNieuwsitems);
}

export function currentNewsSite() {
  return getDashboardConfig().sharepointNieuws.siteUrl;
}
