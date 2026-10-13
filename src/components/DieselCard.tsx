import { formatDutchPercent, formatEuro, formatPublicationDate } from "../lib/format";
import { useDieselSurcharge } from "../services/dieselService";
import type { DieselWeek } from "../types";
import { CardState } from "./CardState";

const weekLabel = new Intl.DateTimeFormat("nl-NL", {
  timeZone: "Europe/Amsterdam",
  day: "numeric",
  month: "short",
});

function formatPeildatum(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return formatPublicationDate(value);
}

function formatWeek(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return weekLabel.format(new Date(parsed));
}

function WeekColumns({ weeks }: { weeks: DieselWeek[] }) {
  const maxPercent = Math.max(...weeks.map((week) => week.toeslagPercentage), 0.1);
  return (
    <ul
      className="grid h-full min-h-0 gap-2"
      style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
    >
      {weeks.map((week) => {
        const height = Math.max(12, (week.toeslagPercentage / maxPercent) * 100);
        return (
          <li key={`${week.peildatum}-${week.toeslagPercentage}`} className="flex min-h-0 min-w-0 flex-col items-center">
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className={`w-8 max-w-full rounded-t ${week.actief ? "bg-gold" : "bg-[#9fd0ea]/80"}`}
                style={{ height: `${height}%` }}
              />
            </div>
            <p className="mt-2 font-display text-[18px] leading-none font-semibold tabular-nums">
              {formatDutchPercent(week.toeslagPercentage)}
            </p>
            <p className="mt-1 truncate text-[12px] text-mist">{formatWeek(week.peildatum)}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function DieselCard() {
  const state = useDieselSurcharge();

  if (state.status === "error") {
    return <CardState status="error" title="Dieseltoeslag" message={state.message} />;
  }
  if (state.status === "empty") {
    return <CardState status="empty" title="Dieseltoeslag" message="Geen toeslag beschikbaar." />;
  }
  if (state.status !== "ready") {
    return <CardState status="loading" title="Dieseltoeslag" message="Toeslag laden." />;
  }

  const surcharge = state.data;
  const weeks = (surcharge.weken?.length ? surcharge.weken : [surcharge]).slice(-5);
  const priceLabel = surcharge.dieselPrijs > 0 ? `dieselprijs ${formatEuro(surcharge.dieselPrijs)}` : "geen dieselprijs";

  return (
    <article className="tv-card flex h-full min-h-0 flex-col px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-[32px] leading-none font-semibold tracking-wide uppercase">
            Dieseltoeslag
          </h2>
          <p className="mt-1 truncate text-[13px] font-medium tracking-[0.14em] text-mist uppercase">
            Dieseltoeslagen Asvervoer
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-gold/45 bg-gold/12 px-3 py-1 text-[13px] font-semibold tracking-[0.12em] text-[#f0d078] uppercase">
          {surcharge.actief ? "actief" : "inactief"}
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="flex items-end gap-2 font-display leading-none">
          <span className="text-[64px] font-semibold tabular-nums">{formatDutchPercent(surcharge.toeslagPercentage)}</span>
          <span className="mb-1 text-[20px] font-medium text-mist">%</span>
        </p>
        <p className="mb-1 text-[16px] font-medium text-paper">{priceLabel}</p>
      </div>
      <div className="mt-3 min-h-0 flex-1">
        <WeekColumns weeks={weeks} />
      </div>
      <p className="mt-2 truncate text-[13px] text-mist">Peildatum {formatPeildatum(surcharge.peildatum)}</p>
    </article>
  );
}
