export type DieselSurcharge = {
  peildatum: string;
  dieselPrijs: number;
  toeslagPercentage: number;
  actief: boolean;
};

export interface DieselSurchargeProvider {
  getCurrentData(): Promise<DieselSurcharge>;
}
