import { formatAmsterdamTime, formatWaterChange } from "../lib/format";
import type { WaterStationResult, WaterStatus, WaterTrend } from "../types";
import { CardState } from "./CardState";
import { KpiCard } from "./KpiCard";

type WaterLevelCardProps = {
  station: WaterStationResult;
  delay?: number;
};

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

export function WaterLevelCard({ station, delay = 0 }: WaterLevelCardProps) {
  if (!isReady(station)) {
    return <CardState status="error" title={station.name} message={station.error ?? "Peil niet beschikbaar."} />;
  }

  return (
    <KpiCard
      title={station.name}
      eyebrow={`${station.river} · waterstand`}
      value={String(station.levelCm)}
      unit="cm"
      status={station.status}
      tone={station.status}
      trend={station.trend}
      delta={formatWaterChange(station.changeCm)}
      updatedLabel={`Bijgewerkt ${formatAmsterdamTime(station.updatedAt)} · ${station.source}`}
      delay={delay}
    />
  );
}
