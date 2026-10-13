import { Cloud, CloudDrizzle, CloudRain, CloudSun, Droplets, MapPin, Sun, Wind } from "lucide-react";
import { getWeather } from "../services/dashboardService";
import type { WeatherIconName } from "../types";

const icons = {
  cloud: Cloud,
  rain: CloudRain,
  showers: CloudDrizzle,
  sun: Sun,
  "sun-cloud": CloudSun,
} satisfies Record<WeatherIconName, typeof Cloud>;

export function WeatherCard() {
  const weather = getWeather();
  const CurrentIcon = icons[weather.icon];

  return (
    <article className="tv-card flex h-full flex-col px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#7eb6ff]/15 text-[#9dcbff]">
            <CurrentIcon className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <h2 className="font-display text-[32px] font-semibold uppercase leading-none tracking-wide">
            Weerbericht
          </h2>
        </div>
        <p className="flex items-center gap-2 text-[18px] font-medium text-paper">
          <MapPin className="h-4 w-4 text-sprout" strokeWidth={2.3} />
          {weather.location}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-8">
        <div className="flex items-end gap-4">
          <p className="font-display text-[84px] font-semibold leading-[0.8] tabular-nums">
            {weather.temperatureC}°
          </p>
          <div className="mb-1">
            <p className="text-[24px] font-semibold leading-tight">{weather.condition}</p>
            <p className="text-[17px] text-mist">Voelt als {weather.feelsLikeC}°</p>
          </div>
        </div>
        <div className="ml-auto flex flex-col gap-2 text-[17px]">
          <p className="flex items-center gap-2 text-mist">
            <Wind className="h-4 w-4 text-sprout" />
            <span className="text-paper">{weather.wind}</span>
          </p>
          <p className="flex items-center gap-2 text-mist">
            <Droplets className="h-4 w-4 text-[#9dcbff]" />
            <span className="text-paper">{weather.humidityPct}% vocht</span>
          </p>
          <p className="max-w-[280px] text-mist">{weather.summary}</p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-4 gap-3">
        {weather.forecast.map((day) => {
          const Icon = icons[day.icon];
          return (
            <div
              key={day.day}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2.5"
            >
              <div>
                <p className="text-[15px] font-semibold uppercase tracking-[0.12em] text-mist">
                  {day.day}
                </p>
                <p className="mt-1 font-display text-[26px] leading-none font-semibold tabular-nums">
                  {day.highC}°
                  <span className="ml-1.5 text-[18px] font-medium text-mist">{day.lowC}°</span>
                </p>
              </div>
              <span className="text-right">
                <Icon className="ml-auto h-5 w-5 text-[#9dcbff]" strokeWidth={2.1} />
                <p className="mt-1 text-[14px] text-mist">{day.condition}</p>
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
