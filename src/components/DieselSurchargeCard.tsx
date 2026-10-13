import { Fuel } from "lucide-react";
import type { DieselSurcharge } from "../data/dieselSurcharge";
import { formatDutchPercent } from "../lib/format";

type DieselSurchargeCardProps = {
  surcharge: DieselSurcharge;
};

export function DieselSurchargeCard({ surcharge }: DieselSurchargeCardProps) {
  return (
    <article className="tv-card relative flex h-full flex-col overflow-hidden px-5 py-4">
      <span className="absolute inset-y-0 left-0 w-1.5 bg-[#e0a35a]" />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e0a35a]/15 text-[#f0c27a]">
            <Fuel className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-display text-[32px] font-semibold uppercase leading-none tracking-wide">
              Dieseltoeslag
            </h2>
            <p className="mt-1 text-[15px] font-medium uppercase tracking-[0.16em] text-mist">
              Brandstof
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[#e0a35a]/40 bg-[#e0a35a]/12 px-3 py-1 text-[15px] font-semibold text-[#f0c27a]">
          {surcharge.periodLabel}
        </span>
      </div>
      <div className="mt-auto pl-2">
        <p className="flex items-start font-display leading-none" aria-label={`${formatDutchPercent(surcharge.percentage)} procent`}>
          <span className="text-[78px] font-semibold tabular-nums">
            {formatDutchPercent(surcharge.percentage)}
          </span>
          <span className="mt-1 ml-1 text-[34px] font-semibold text-[#f0c27a]">%</span>
        </p>
        <p className="mt-2 text-[18px] leading-snug text-mist">{surcharge.note}</p>
      </div>
    </article>
  );
}
