import { formatAmsterdamTime, formatWaterChange } from "../lib/format";
import type { WaterLevelReading } from "../types";
import { KpiCard } from "./KpiCard";

type WaterLevelCardProps = {
  reading: WaterLevelReading;
  delay?: number;
};

export function WaterLevelCard({ reading, delay = 0 }: WaterLevelCardProps) {
  return (
    <KpiCard
      title={reading.name}
      eyebrow={`${reading.river} · waterstand`}
      value={String(reading.levelCm)}
      unit="cm"
      status={reading.status}
      tone={reading.status}
      trend={reading.trend}
      delta={formatWaterChange(reading.changeCm)}
      updatedLabel={`Bijgewerkt ${formatAmsterdamTime(reading.updatedAt)}`}
      delay={delay}
    />
  );
}
