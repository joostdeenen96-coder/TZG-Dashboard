export type WaterStatus = "laag" | "normaal" | "hoog";

export type WaterTrend = "stijgend" | "dalend" | "gelijk";

export type WaterStationId = "kaub" | "ruhrort" | "maxau";

export type WaterLevelReading = {
  id: WaterStationId;
  name: string;
  river: string;
  levelCm: number;
  changeCm: number;
  trend: WaterTrend;
  status: WaterStatus;
  updatedAt: string;
};

export type QueryState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; data: T };

export type DieselSurcharge = {
  percentage: number;
  periodLabel: string;
  note: string;
  trend: WaterTrend;
  changePoints: number;
  status: string;
  updatedAt: string;
};

export type WeatherIconName = "cloud" | "rain" | "showers" | "sun" | "sun-cloud";

export type ForecastDay = {
  day: string;
  icon: WeatherIconName;
  highC: number;
  lowC: number;
  condition: string;
};

export type WeatherReport = {
  location: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: string;
  summary: string;
  icon: WeatherIconName;
  wind: string;
  humidityPct: number;
  forecast: ForecastDay[];
};

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
};

export type ProjectSlide = {
  id: string;
  title: string;
  location: string;
  url: string;
  gradient: string;
  objectPosition: string;
};
