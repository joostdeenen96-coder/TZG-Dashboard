export type DieselTrend = "stijgend" | "dalend" | "gelijk";

export type DieselSurcharge = {
  percentage: number;
  periodLabel: string;
  note: string;
  trend: DieselTrend;
  changePoints: number;
  status: string;
  updatedAt: string;
};

export interface DieselSurchargeProvider {
  getCurrentData(): DieselSurcharge;
}
