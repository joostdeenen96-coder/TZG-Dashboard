export type DieselWeek = {
  peildatum: string;
  dieselPrijs: number;
  toeslagPercentage: number;
  actief: boolean;
};

export type DieselSurcharge = DieselWeek & {
  weken: DieselWeek[];
};

export interface DieselSurchargeProvider {
  getCurrentData(): Promise<DieselSurcharge>;
}
