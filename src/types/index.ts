export type WaterStatus = "laag" | "normaal" | "hoog";

export type WaterLevel = {
  id: string;
  name: string;
  river: string;
  levelCm: number;
  changeCm: number;
  status: WaterStatus;
};

export type DieselSurcharge = {
  percentage: number;
  periodLabel: string;
  note: string;
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
  image: string;
  gradient: string;
  objectPosition: string;
};
