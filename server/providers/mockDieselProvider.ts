import type { DieselSurcharge, DieselSurchargeProvider } from "./dieselSurchargeProvider.js";

const fallbackSurcharge: DieselSurcharge = {
  peildatum: "2026-10-13",
  dieselPrijs: 0,
  toeslagPercentage: 12.4,
  actief: true,
};

export class MockDieselProvider implements DieselSurchargeProvider {
  getCurrentData(): Promise<DieselSurcharge> {
    return Promise.resolve(fallbackSurcharge);
  }
}
