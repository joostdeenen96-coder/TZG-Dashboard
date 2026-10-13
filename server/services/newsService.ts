import { currentNewsSite, readWijNews, type WijNewsItem } from "../providers/wijNewsProvider.js";

export type WijNewsResponse = {
  site: string;
  source: "WijTeunesen";
  connected: boolean;
  items: WijNewsItem[];
  error: string | null;
};

export async function getWijNews(): Promise<WijNewsResponse> {
  try {
    const items = await readWijNews();
    return { site: currentNewsSite(), source: "WijTeunesen", connected: true, items, error: null };
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "WijTeunesen-nieuws niet bereikbaar.";
    console.error(`WijTeunesen-nieuws via sharepoint mislukt (${message}).`);
    return { site: currentNewsSite(), source: "WijTeunesen", connected: false, items: [], error: message };
  }
}
