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

export const weather: WeatherReport = {
  location: "Gennep",
  temperatureC: 14,
  feelsLikeC: 12,
  condition: "Bewolkt",
  summary: "Overwegend bewolkt, later een enkele bui.",
  icon: "cloud",
  wind: "ZW 4 Bft",
  humidityPct: 78,
  forecast: [
    { day: "Vandaag", icon: "cloud", highC: 15, lowC: 9, condition: "Bewolkt" },
    { day: "Woensdag", icon: "rain", highC: 13, lowC: 8, condition: "Regen" },
    { day: "Donderdag", icon: "showers", highC: 14, lowC: 7, condition: "Buien" },
    { day: "Vrijdag", icon: "sun-cloud", highC: 16, lowC: 8, condition: "Opklaringen" },
  ],
};
