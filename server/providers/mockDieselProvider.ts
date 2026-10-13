import type { DieselSurcharge, DieselSurchargeProvider } from "./dieselSurchargeProvider.js";

const currentSurcharge: DieselSurcharge = {
  percentage: 12.4,
  periodLabel: "oktober 2026",
  note: "Gasolieprijs van september.",
  trend: "stijgend",
  changePoints: 0.2,
  status: "geldig",
  updatedAt: "2026-10-13T06:15:00+02:00",
};

export class MockDieselProvider implements DieselSurchargeProvider {
  getCurrentData(): DieselSurcharge {
    return currentSurcharge;
  }
}
