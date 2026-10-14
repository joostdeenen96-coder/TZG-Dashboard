import { getDashboardConfig } from "../services/dashboardConfig.js";
import { graphGet, graphUrl, resetGraphCache } from "../services/graphClient.js";
import { sharePointGraphPath } from "../services/settingsService.js";

export type WijNewsItem = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  imagePath: string | null;
};

export type StoredNewsImage =
  | { kind: "cdn"; url: string }
  | { kind: "sharepoint"; fileUrl: string };

const NEWS_LIMIT = 5;
const CDN_HOST = "cdn.hubblecontent.osi.office.net";

let images = new Map<string, StoredNewsImage>();
let pending: Promise<WijNewsItem[]> | null = null;

export function resetWijNewsCache() {
  resetGraphCache();
  images = new Map();
  pending = null;
}

export function storedNewsImage(id: string) {
  return images.get(id) ?? null;
}

function asObject(value: unknown, message: string) {
  if (!value || typeof value !== "object") throw new Error(message);
  return value as Record<string, unknown>;
}

function textField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function plainText(value: unknown, limit = 420) {
  if (typeof value !== "string") return "";
  const cleaned = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= limit) return cleaned;
  const cut = cleaned.slice(0, limit);
  const word = cut.lastIndexOf(" ");
  const end = word > 80 ? word : limit;
  return `${cut.slice(0, end).trim()}…`;
}

function odataText(value: string) {
  return value.replaceAll("'", "''");
}

function nextGraphLink(payload: Record<string, unknown>) {
  if (typeof payload["@odata.nextLink"] !== "string") return null;
  const next = new URL(payload["@odata.nextLink"]);
  if (next.origin !== "https://graph.microsoft.com") throw new Error("Onverwachte Graph-vervolgkoppeling.");
  return next;
}

async function openNewsLibrary(siteUrl: string, bibliotheek: string) {
  const site = asObject(await graphGet(graphUrl(sharePointGraphPath(siteUrl))), "Nieuwssite is ongeldig.");
  if (typeof site.id !== "string") throw new Error("Nieuwssite niet gevonden.");
  const payload = asObject(
    await graphGet(
      graphUrl(`/sites/${site.id}/lists`, {
        $select: "id,displayName",
        $filter: `displayName eq '${odataText(bibliotheek)}'`,
      }),
    ),
    "Nieuwspagina's zijn ongeldig.",
  );
  if (!Array.isArray(payload.value)) throw new Error("Nieuwspagina's zijn ongeldig.");
  const library = payload.value
    .map((item) => asObject(item, "Nieuwspagina is ongeldig."))
    .find((item) => item.displayName === bibliotheek);
  if (!library || typeof library.id !== "string") throw new Error(`Bibliotheek ${bibliotheek} niet gevonden.`);
  return { siteId: site.id, libraryId: library.id, libraryName: bibliotheek };
}

export async function testNewsLibrary(siteUrl?: string, bibliotheek?: string) {
  const config = getDashboardConfig();
  const found = await openNewsLibrary(
    siteUrl ?? config.sharepointNieuws.siteUrl,
    bibliotheek ?? config.sharepointNieuws.bibliotheek,
  );
  return `Nieuws: bibliotheek ${found.libraryName} gevonden.`;
}

type DutchRow = {
  id: string;
  title: string;
  file: string;
  publishedAt: string;
};

function isPromoted(value: unknown) {
  return value === 2 || value === "2";
}

async function readDutchRows(siteId: string, libraryId: string) {
  const rows: DutchRow[] = [];
  let next: URL | null = graphUrl(`/sites/${siteId}/lists/${libraryId}/items`, {
    $expand: "fields($select=Title,Nieuws_x0020_taal,PromotedState,Created,FirstPublishedDate,FileLeafRef)",
    $orderby: "lastModifiedDateTime desc",
    $top: "25",
  });
  for (let page = 0; page < 3 && next; page += 1) {
    const payload = asObject(await graphGet(next), "Nieuwspagina's zijn ongeldig.");
    if (!Array.isArray(payload.value)) throw new Error("Nieuwspagina's zijn ongeldig.");
    for (const item of payload.value) {
      const row = asObject(item, "Nieuwspagina is ongeldig.");
      const fields = asObject(row.fields, "Nieuwspagina mist velden.");
      if (!isPromoted(fields.PromotedState) || fields.Nieuws_x0020_taal !== "NL") continue;
      const title = textField(fields.Title);
      const file = textField(fields.FileLeafRef);
      const publishedAt = textField(fields.FirstPublishedDate) || textField(fields.Created);
      const id = textField(row.id);
      if (!title || !file || !publishedAt || !id) continue;
      rows.push({ id, title, file, publishedAt });
    }
    if (rows.length >= NEWS_LIMIT) break;
    next = nextGraphLink(payload);
  }
  return rows.sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt)).slice(0, NEWS_LIMIT);
}

async function readPages(siteId: string, names: Set<string>) {
  const byName = new Map<string, Record<string, unknown>>();
  let next: URL | null = graphUrl(`/sites/${siteId}/pages`, {
    $top: "25",
    $orderby: "lastModifiedDateTime desc",
  });
  for (let page = 0; page < 3 && next && byName.size < names.size; page += 1) {
    const payload = asObject(await graphGet(next), "Nieuwspagina's zijn ongeldig.");
    if (!Array.isArray(payload.value)) throw new Error("Nieuwspagina's zijn ongeldig.");
    for (const item of payload.value) {
      const row = asObject(item, "Nieuwspagina is ongeldig.");
      if (typeof row.name === "string" && names.has(row.name)) byName.set(row.name, row);
    }
    next = nextGraphLink(payload);
  }
  return byName;
}

function cdnUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname === CDN_HOST) return url.toString();
  } catch {
    return null;
  }
  return null;
}

function sharePointFileUrl(thumbnail: string, siteUrl: string) {
  let url: URL;
  let site: URL;
  try {
    url = new URL(thumbnail);
    site = new URL(siteUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname !== site.hostname) return null;
  let pathname = url.pathname;
  if (pathname.toLowerCase().endsWith("/getpreview.ashx")) {
    const raw = url.searchParams.get("path");
    if (!raw || !raw.startsWith("/")) return null;
    pathname = raw;
  }
  const prefix = `${site.pathname.replace(/\/$/, "")}/SiteAssets/`;
  if (!pathname.toLowerCase().startsWith(prefix.toLowerCase()) || pathname.includes("..")) return null;
  const file = new URL(site.origin);
  file.pathname = pathname;
  return file.toString();
}

function rememberImage(id: string, thumbnail: unknown, siteUrl: string, next: Map<string, StoredNewsImage>) {
  if (!/^[A-Za-z0-9-]{1,80}$/.test(id) || typeof thumbnail !== "string" || !thumbnail.trim()) return false;
  const cdn = cdnUrl(thumbnail);
  if (cdn) {
    next.set(id, { kind: "cdn", url: cdn });
    return true;
  }
  const fileUrl = sharePointFileUrl(thumbnail, siteUrl);
  if (!fileUrl) return false;
  next.set(id, { kind: "sharepoint", fileUrl });
  return true;
}

async function loadWijNews(): Promise<WijNewsItem[]> {
  const config = getDashboardConfig();
  const siteUrl = config.sharepointNieuws.siteUrl;
  const library = await openNewsLibrary(siteUrl, config.sharepointNieuws.bibliotheek);
  const rows = await readDutchRows(library.siteId, library.libraryId);
  const pages = await readPages(library.siteId, new Set(rows.map((row) => row.file)));
  const nextImages = new Map<string, StoredNewsImage>();
  const items = rows.map((row) => {
    const page = pages.get(row.file);
    const id = page && typeof page.id === "string" && /^[A-Za-z0-9-]{1,80}$/.test(page.id) ? page.id : row.id;
    const hasImage = page ? rememberImage(id, page.thumbnailWebUrl, siteUrl, nextImages) : false;
    const summary = plainText(page?.description) || row.title;
    return {
      id,
      title: row.title,
      summary,
      publishedAt: row.publishedAt,
      imagePath: hasImage ? `/api/news/${id}/image` : null,
    };
  });
  images = nextImages;
  console.info(`WijTeunesen: ${items.length} Nederlandse berichten, ${nextImages.size} met foto.`);
  return items;
}

export function readWijNews() {
  if (!pending) {
    pending = loadWijNews().finally(() => {
      pending = null;
    });
  }
  return pending;
}

export function currentNewsSite() {
  return getDashboardConfig().sharepointNieuws.siteUrl;
}
