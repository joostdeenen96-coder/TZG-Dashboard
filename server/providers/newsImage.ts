import { getGraphAccessToken, graphUrl } from "../services/graphClient.js";
import { currentNewsSite, storedNewsImage, type StoredNewsImage } from "./wijNewsProvider.js";

const MAX_BYTES = 8_000_000;
const CDN_HOST = "cdn.hubblecontent.osi.office.net";

function sniff(bytes: Buffer, header: string | null) {
  const declared = header?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (declared === "image/jpeg" || declared === "image/png" || declared === "image/webp" || declared === "image/gif") {
    return declared;
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

function siteHost() {
  return new URL(currentNewsSite()).hostname;
}

function allowed(url: URL, kind: StoredNewsImage["kind"]) {
  if (url.protocol !== "https:") return false;
  if (kind === "cdn") return url.hostname === CDN_HOST;
  return url.hostname === "graph.microsoft.com" || url.hostname === siteHost() || url.hostname.endsWith(".sharepoint.com");
}

async function fetchImage(start: string, kind: StoredNewsImage["kind"]) {
  let current = start;
  for (let hop = 0; hop < 4; hop += 1) {
    const url = new URL(current);
    if (!allowed(url, kind)) throw new Error("Afbeeldingsadres is niet toegestaan.");
    const headers: Record<string, string> = { accept: "image/jpeg,image/png,image/webp,image/gif,image/*" };
    if (kind === "sharepoint" && url.hostname === "graph.microsoft.com") {
      headers.authorization = `Bearer ${await getGraphAccessToken()}`;
    }
    const response = await fetch(url, { headers, redirect: "manual", signal: AbortSignal.timeout(12_000) });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Afbeelding heeft geen vervolgadres.");
      current = new URL(location, url).toString();
      continue;
    }
    if (!response.ok) throw new Error(`Afbeelding antwoordde met ${response.status}.`);
    const announced = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(announced) && announced > MAX_BYTES) throw new Error("Afbeelding is te groot.");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_BYTES) throw new Error("Afbeelding is te groot.");
    const contentType = sniff(bytes, response.headers.get("content-type"));
    if (!contentType) throw new Error("Afbeelding heeft geen geldig formaat.");
    return { bytes, contentType };
  }
  throw new Error("Afbeelding heeft te veel omleidingen.");
}

function shareId(fileUrl: string) {
  return `u!${Buffer.from(fileUrl).toString("base64url")}`;
}

export async function fetchNewsImage(id: string) {
  if (!/^[A-Za-z0-9-]{1,80}$/.test(id)) return null;
  const stored = storedNewsImage(id);
  if (!stored) return null;
  if (stored.kind === "cdn") return fetchImage(stored.url, "cdn");
  const file = new URL(stored.fileUrl);
  if (file.protocol !== "https:" || file.hostname !== siteHost()) return null;
  const sitePath = new URL(currentNewsSite()).pathname.replace(/\/$/, "");
  if (!file.pathname.toLowerCase().startsWith(`${sitePath.toLowerCase()}/siteassets/`)) return null;
  return fetchImage(graphUrl(`/shares/${shareId(file.toString())}/driveItem/content`).toString(), "sharepoint");
}
