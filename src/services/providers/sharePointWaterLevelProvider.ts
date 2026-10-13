import type { WaterLevelProvider, WaterLevelReading } from "../../types";

export type SharePointWaterLevelConfig = {
  siteUrl: string;
  listTitle: string;
};

export class SharePointWaterLevelProvider implements WaterLevelProvider {
  readonly kind = "sharepoint" as const;
  private readonly config: SharePointWaterLevelConfig;

  constructor(config?: SharePointWaterLevelConfig) {
    this.config = config ?? {
      siteUrl: "",
      listTitle: "Waterstanden",
    };
  }

  getLevels(): WaterLevelReading[] {
    return [];
  }

  loadLevels(): Promise<WaterLevelReading[]> {
    const site = this.config.siteUrl || "geen site";
    return Promise.reject(
      new Error(`SharePoint-provider (${site} / ${this.config.listTitle}) is niet gekoppeld.`),
    );
  }
}
