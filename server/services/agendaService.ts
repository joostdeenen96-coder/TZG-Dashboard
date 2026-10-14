import { currentAgendaSite, readWijAgenda, type WijAgendaItem } from "../providers/wijAgendaProvider.js";

export type WijAgendaResponse = {
  site: string;
  source: "WijTeunesen";
  connected: boolean;
  items: WijAgendaItem[];
  error: string | null;
};

export async function getWijAgenda(): Promise<WijAgendaResponse> {
  try {
    const items = await readWijAgenda();
    return { site: currentAgendaSite(), source: "WijTeunesen", connected: true, items, error: null };
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "WijTeunesen-agenda niet bereikbaar.";
    console.error(`WijTeunesen-agenda via sharepoint mislukt (${message}).`);
    return { site: currentAgendaSite(), source: "WijTeunesen", connected: false, items: [], error: message };
  }
}
