import { Cloud, CloudDrizzle, CloudRain, CloudSun, MapPin, Sun, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { readWeather } from "../services/dashboardService";
import { useScreenConfig } from "../services/dashboardConfigService";
import type { WeatherIconName } from "../types";
import { CardState } from "./CardState";

const icons = {
  cloud: Cloud,
  rain: CloudRain,
  showers: CloudDrizzle,
  sun: Sun,
  "sun-cloud": CloudSun,
} satisfies Record<WeatherIconName, typeof Cloud>;

export function WeatherCard() {
  const plaatsnaam = useScreenConfig().weer.plaatsnaam;
  const state = readWeather();
  if (state.status === "error") {
    return <CardState status="error" title="Weerbericht" message={state.message} />;
  }
  if (state.status === "empty") {
    return <CardState status="empty" title="Weerbericht" message="Geen weerbericht beschikbaar." />;
  }
  if (state.status !== "ready") {
    return <CardState status="loading" title="Weerbericht" message="Weer laden." />;
  }

  const weather = state.data;
  const CurrentIcon = icons[weather.icon];

  return (
    <motion.article
      className="tv-card flex h-full flex-col px-6 py-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[20px] border border-white/12 bg-white/[0.06] text-gold">
            <CurrentIcon className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <h2 className="font-display text-[32px] leading-none font-semibold tracking-[-0.015em]">Weerbericht</h2>
        </div>
        <p className="flex items-center gap-2 text-[18px] font-medium">
          <MapPin className="h-4 w-4 text-gold" strokeWidth={2.3} />
          {plaatsnaam || weather.location}
        </p>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 items-center gap-10">
        <p className="font-display text-[92px] leading-none font-semibold tabular-nums">{weather.temperatureC}°</p>
        <div className="min-w-0">
          <p className="text-[28px] leading-tight font-semibold">{weather.condition}</p>
          <p className="mt-2 max-w-[420px] text-[18px] leading-snug text-mist">{weather.summary}</p>
          <p className="mt-4 flex items-center gap-2 text-[20px]">
            <Wind className="h-5 w-5 text-gold" />
            <span>{weather.wind}</span>
          </p>
        </div>
      </div>
    </motion.article>
  );
}
