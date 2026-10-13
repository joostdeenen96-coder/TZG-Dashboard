import type {
  DieselSurcharge,
  NewsItem,
  ProjectSlide,
  WaterLevel,
  WeatherReport,
} from "../types";

const waterLevels: WaterLevel[] = [
  {
    id: "kaub",
    name: "Kaub",
    river: "Rijn",
    levelCm: 168,
    changeCm: -4,
    status: "laag",
  },
  {
    id: "ruhrort",
    name: "Ruhrort",
    river: "Rijn",
    levelCm: 286,
    changeCm: 3,
    status: "normaal",
  },
  {
    id: "maxau",
    name: "Maxau",
    river: "Rijn",
    levelCm: 512,
    changeCm: -11,
    status: "normaal",
  },
];

const dieselSurcharge: DieselSurcharge = {
  percentage: 12.4,
  periodLabel: "oktober 2026",
  note: "Gasolieprijs van september.",
};

const weather: WeatherReport = {
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

const newsItems: NewsItem[] = [
  {
    id: "grindafvaart",
    title: "Extra grindafvaart naar Rotterdam",
    summary: "Twee duwbakken vertrekken vanavond vanaf de loswal in Gennep.",
    publishedAt: "2026-10-13T14:05:00+02:00",
  },
  {
    id: "n271",
    title: "Nachtwerk asfalt op de N271",
    summary: "De ploeg rijdt woensdag tot en met vrijdag tussen 20:00 en 05:00.",
    publishedAt: "2026-10-13T08:40:00+02:00",
  },
  {
    id: "dijk",
    title: "Dijkversterking Maas ligt voor",
    summary: "Het grondwerk bij het Genneperhuis loopt twee dagen voor op schema.",
    publishedAt: "2026-10-12T16:15:00+02:00",
  },
  {
    id: "milsbeek",
    title: "Nieuwe put zandwinning Milsbeek",
    summary: "De winvergunning is rond; de put gaat volgende week open.",
    publishedAt: "2026-10-11T11:00:00+02:00",
  },
];

const slides: ProjectSlide[] = [
  {
    id: "zandwinning",
    title: "Zandwinning Milsbeek",
    location: "Milsbeek",
    image: "/projects/zandwinning.jpg",
    gradient: "from-[#4a3418] via-[#1c2818] to-[#0c1410]",
    objectPosition: "center center",
  },
  {
    id: "grondwerk",
    title: "Grondwerk bedrijventerrein",
    location: "Heijen",
    image: "/projects/grondwerk.jpg",
    gradient: "from-[#24502c] via-[#14301c] to-[#0b140f]",
    objectPosition: "center 42%",
  },
  {
    id: "infra",
    title: "Onderhoud N271",
    location: "Gennep — Boxmeer",
    image: "/projects/infra.jpg",
    gradient: "from-[#1e4a30] via-[#143024] to-[#0a120e]",
    objectPosition: "center 70%",
  },
  {
    id: "binnenvaart",
    title: "Grindtransport Maas",
    location: "Loswal Gennep",
    image: "/projects/binnenvaart.jpg",
    gradient: "from-[#1a3c52] via-[#143028] to-[#0a120e]",
    objectPosition: "center 38%",
  },
  {
    id: "oever",
    title: "Oeverwerk aan de kade",
    location: "Gennep",
    image: "/projects/oeverwerk.jpg",
    gradient: "from-[#2a3c4a] via-[#1a2c22] to-[#0c1210]",
    objectPosition: "center 55%",
  },
];

const slideIntervalMs = 8000;

export function getWaterLevels() {
  return waterLevels;
}

export function getDieselSurcharge() {
  return dieselSurcharge;
}

export function getWeather() {
  return weather;
}

export function getNews() {
  return newsItems;
}

export function getSlides() {
  return slides;
}

export function getSlideIntervalMs() {
  return slideIntervalMs;
}
