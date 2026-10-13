import type { DieselSurcharge, DieselSurchargeProvider } from "./dieselSurchargeProvider.js";

export class SharePointDieselProvider implements DieselSurchargeProvider {
  getCurrentData(): DieselSurcharge {
    throw new Error("SharePoint-koppeling voor de dieseltoeslag is nog niet aangesloten.");
  }
}
