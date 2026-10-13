import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { formatAmsterdamTime, formatWaterChange } from "../lib/format";
import type { WaterForecastPoint, WaterStationResult, WaterStatus, WaterTrend } from "../types";
import { CardState } from "./CardState";
import { WaterChart } from "./WaterChart";

type WaterLevelCardProps = {
  station: WaterStationResult;
};

const dayLabel = new Intl.DateTimeFormat("nl-NL", {
  timeZone: "Europe/Amsterdam",
  weekday: "short",
  day: "numeric",
  month: "short",
});

function isReady(station: WaterStationResult): station is WaterStationResult & {
  levelCm: number;
  changeCm: number;
  trend: WaterTrend;
  status: WaterStatus;
  updatedAt: string;
} {
  return (
    station.error === null &&
    station.levelCm !== null &&
    station.changeCm !== null &&
    station.trend !== null &&
    station.status !== null &&
    station.updatedAt !== null
  );
}

function dailyForecast(points: WaterForecastPoint[]) {
  const byDay = new Map<string, WaterForecastPoint>();
  for (const point of points) byDay.set(point.timestamp.slice(0, 10), point);
  return [...byDay.values()].slice(0, 5);
}

export function WaterLevelCard({ station }: WaterLevelCardProps) {
  if (!isReady(station)) {
    return <CardState status="error" title={station.name} message={station.error ?? "Peil niet beschikbaar."} />;
  }

  const TrendIcon = station.trend === "stijgend" ? ArrowUp : station.trend === "dalend" ? ArrowDown : Minus;
  const days = dailyForecast(station.forecast);

  return (
    <article className="tv-card flex h-full min-h-0 flex-col px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-[32px] leading-none font-semibold tracking-wide uppercase">
            {station.name}
          </h2>
          <p className="mt-1 text-[13px] font-medium tracking-[0.14em] text-mist uppercase">
            {station.river} · waterstand
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[#e6b325]/45 bg-[#e6b325]/12 px-3 py-1 text-[13px] font-semibold tracking-[0.12em] text-[#f0d078] uppercase">
          {station.status}
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="flex items-end gap-2 font-display leading-none">
          <span className="text-[64px] font-semibold tabular-nums">{station.levelCm}</span>
          <span className="mb-1 text-[20px] font-medium text-mist">cm</span>
        </p>
        <p className="mb-1 flex items-center gap-2 text-[16px] font-medium">
          <TrendIcon className="h-4 w-4 text-gold" strokeWidth={2.4} />
          <span className="text-gold">{station.trend}</span>
          <span className="text-mist">{formatWaterChange(station.changeCm)}</span>
        </p>
      </div>
      <div className="mt-2 min-h-0 flex-1">
        <WaterChart series={station.series} forecast={station.forecast} />
      </div>
      {days.length > 0 ? (
        <ul className="mt-2 grid grid-cols-5 gap-1">
          {days.map((point) => (
            <li key={point.timestamp} className="min-w-0 text-center">
              <p className="truncate text-[12px] text-mist">{dayLabel.format(new Date(point.timestamp))}</p>
              <p className="font-display text-[18px] leading-none font-semibold tabular-nums">{point.levelCm}</p>
              <p className="truncate text-[11px] tracking-wide text-gold uppercase">{point.kind}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {station.forecastError ? <p className="mt-1 truncate text-[13px] text-mist">{station.forecastError}</p> : null}
      <p className="mt-1 truncate text-[13px] text-mist">
        Bijgewerkt {formatAmsterdamTime(station.updatedAt)} · {station.source}
      </p>
    </article>
  );
}
