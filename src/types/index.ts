export type WaterStatus = "laag" | "normaal" | "hoog";

export type WaterTrend = "stijgend" | "dalend" | "gelijk";

export type WaterStationId = "kaub" | "ruhrort" | "maxau";

export type WaterPoint = {
  timestamp: string;
  levelCm: number;
};

export type WaterForecastKind = "verwacht" | "inschatting";

export type WaterForecastPoint = WaterPoint & {
  kind: WaterForecastKind;
};

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
  series: WaterPoint[];
  forecast: WaterForecastPoint[];
  forecastError: string | null;
  graphPath: string | null;
  error: string | null;
};

export type WijNewsItem = {
  id: string;
  title: string;
  category: string;
  summary: string;
  publishedAt: string;
  imagePath: string | null;
};

export type WijNewsResponse = {
  site: string;
  source: "WijTeunesen";
  connected: boolean;
  items: WijNewsItem[];
  error: string | null;
};

export type WijAgendaItem = {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
};

export type WijAgendaResponse = {
  site: string;
  source: "WijTeunesen";
  connected: boolean;
  items: WijAgendaItem[];
  error: string | null;
};

export type WaterLevelsResponse = Record<WaterStationId, WaterStationResult>;

export type QueryState<T> =
  | { status: "loading"; refreshing: boolean; fetchedAt: string | null }
  | { status: "error"; message: string; refreshing: boolean; fetchedAt: string | null }
  | { status: "empty"; refreshing: boolean; fetchedAt: string | null }
  | { status: "ready"; data: T; refreshing: boolean; fetchedAt: string | null }
  | { status: "fallback"; data: T; message: string; refreshing: boolean; fetchedAt: string | null };

export type DieselWeek = {
  peildatum: string;
  dieselPrijs: number;
  toeslagPercentage: number;
  actief: boolean;
};

export type DieselSurcharge = DieselWeek & {
  weken: DieselWeek[];
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

export type ProjectSlide = {
  id: string;
  title: string;
  location: string;
  url: string;
  gradient: string;
  objectPosition: string;
};
