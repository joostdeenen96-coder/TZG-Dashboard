import type { DieselSurcharge, DieselSurchargeProvider } from "../providers/dieselSurchargeProvider.js";
import { MockDieselProvider } from "../providers/mockDieselProvider.js";
import { SharePointDieselProvider } from "../providers/sharePointDieselProvider.js";

const dieselProviders = {
  mock: new MockDieselProvider(),
  sharepoint: new SharePointDieselProvider(),
} satisfies Record<string, DieselSurchargeProvider>;

type DieselSource = keyof typeof dieselProviders;

const activeDieselSource: DieselSource = "mock";

export function getDieselSurcharge(): DieselSurcharge {
  return dieselProviders[activeDieselSource].getCurrentData();
}
