export type WaterStatus = "laag" | "normaal" | "hoog";

export type WaterTrend = "stijgend" | "dalend" | "gelijk";

export type WaterStationId = "kaub" | "ruhrort" | "maxau";

export type WaterStationResult = {
  id: WaterStationId;
  name: string;
  river: string;
  levelCm: number | null;
  changeCm: number | null;
  trend: WaterTrend | null;
  status: WaterStatus | null;
  updatedAt: string | null;
  source: string;
  error: string | null;
};

export type WaterLevelsResponse = Record<WaterStationId, WaterStationResult>;

export type QueryState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; data: T };

export type DieselSurcharge = {
  peildatum: string;
  dieselPrijs: number;
  toeslagPercentage: number;
  actief: boolean;
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
