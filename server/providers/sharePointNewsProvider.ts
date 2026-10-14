import { graphUrl } from "../services/graphClient.js";

const NEWS_SITE = "https://teunesen.sharepoint.com/sites/wt-nieuws";

export class SharePointNewsProvider {
  readonly siteUrl = NEWS_SITE;

  endpoint() {
    return graphUrl(`/sites/teunesen.sharepoint.com:/sites/wt-nieuws`);
  }

  getCurrentData(): Promise<never> {
    return Promise.reject(new Error("WijTeunesen-nieuws via SharePointNewsProvider is nog niet geïmplementeerd."));
  }
}
