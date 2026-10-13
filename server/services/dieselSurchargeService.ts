import type { DieselSurcharge, DieselSurchargeProvider } from "../providers/dieselSurchargeProvider.js";
import { MockDieselProvider } from "../providers/mockDieselProvider.js";
import { SharePointDieselProvider } from "../providers/sharePointDieselProvider.js";

const dieselProviders = {
  mock: new MockDieselProvider(),
  sharepoint: new SharePointDieselProvider(),
} satisfies Record<string, DieselSurchargeProvider>;

type DieselSource = keyof typeof dieselProviders;

const activeDieselSource: DieselSource = "sharepoint";

export async function getDieselSurcharge(): Promise<DieselSurcharge> {
  try {
    const record = await dieselProviders[activeDieselSource].getCurrentData();
    console.info(
      `Dieseltoeslag via ${activeDieselSource}: peildatum ${record.peildatum}, toeslag ${record.toeslagPercentage}%, actief ${record.actief}.`,
    );
    return record;
  } catch (error) {
    const message = error instanceof Error ? error.message : "onbekende fout";
    console.error(`Dieseltoeslag via ${activeDieselSource} mislukt (${message}). Terugval op MockDieselProvider.`);
    if (activeDieselSource === "mock") throw error;
    return dieselProviders.mock.getCurrentData();
  }
}
