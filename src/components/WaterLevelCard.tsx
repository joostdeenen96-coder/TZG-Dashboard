import { ArrowDown, ArrowUp, Minus, Waves } from "lucide-react";
import type { WaterLevel, WaterStatus } from "../data/waterLevels";
import { formatWaterChange } from "../lib/format";

const statusStyle: Record<
  WaterStatus,
  { label: string; pill: string; rail: string }
> = {
  laag: {
    label: "laag",
    pill: "border-[#f5c16c]/40 bg-[#f5c16c]/12 text-[#f5c16c]",
    rail: "bg-[#f5c16c]",
  },
  normaal: {
    label: "normaal",
    pill: "border-teune/45 bg-teune/15 text-sprout",
    rail: "bg-teune",
  },
  hoog: {
    label: "hoog",
    pill: "border-[#7eb6ff]/40 bg-[#7eb6ff]/12 text-[#7eb6ff]",
    rail: "bg-[#7eb6ff]",
  },
};

type WaterLevelCardProps = {
  level: WaterLevel;
};

export function WaterLevelCard({ level }: WaterLevelCardProps) {
  const status = statusStyle[level.status];
  const Arrow = level.changeCm < 0 ? ArrowDown : level.changeCm > 0 ? ArrowUp : Minus;
  const changeColor =
    level.changeCm < 0 ? "text-[#f5c16c]" : level.changeCm > 0 ? "text-sprout" : "text-mist";

  return (
    <article className="tv-card relative flex h-full flex-col overflow-hidden px-5 py-4">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${status.rail}`} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teune/15 text-sprout">
            <Waves className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-display text-[32px] font-semibold uppercase leading-none tracking-wide">
              {level.name}
            </h2>
            <p className="mt-1 text-[15px] font-medium uppercase tracking-[0.16em] text-mist">
              {level.river} · waterstand
            </p>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[15px] font-semibold uppercase tracking-[0.14em] ${status.pill}`}
        >
          {status.label}
        </span>
      </div>
      <div className="mt-auto pl-2">
        <div className="flex items-end gap-2">
          <span className="font-display text-[78px] font-semibold leading-[0.8] tabular-nums">
            {level.levelCm}
          </span>
          <span className="mb-1 text-[22px] font-medium text-mist">cm</span>
        </div>
        <p className={`mt-2 flex items-center gap-1.5 text-[18px] font-medium ${changeColor}`}>
          <Arrow className="h-4 w-4" strokeWidth={2.4} />
          {formatWaterChange(level.changeCm)}
        </p>
      </div>
    </article>
  );
}
