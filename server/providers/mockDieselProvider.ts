import type { DieselSurcharge, DieselSurchargeProvider } from "./dieselSurchargeProvider.js";

const fallbackWeek = {
  peildatum: "2026-10-13",
  dieselPrijs: 0,
  toeslagPercentage: 12.4,
  actief: true,
};

const fallbackSurcharge: DieselSurcharge = {
  ...fallbackWeek,
  weken: [fallbackWeek],
};

export class MockDieselProvider implements DieselSurchargeProvider {
  getCurrentData(): Promise<DieselSurcharge> {
    return Promise.resolve(fallbackSurcharge);
  }
}
