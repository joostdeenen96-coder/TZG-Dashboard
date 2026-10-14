import { useDieselSurcharge } from "../services/dieselService";
import type { DieselWeek } from "../types";
import { CardState } from "./CardState";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Amsterdam",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const priceFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

function amsterdamDate(iso: string) {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return null;
  const parts = dateFormatter.formatToParts(new Date(parsed));
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  const year = read("year");
  const month = read("month");
  const day = read("day");
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function isoWeekNumber(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function formatPeildatum(iso: string) {
  const date = amsterdamDate(iso);
  if (!date) return iso;
  return `${date.day}-${date.month}-${date.year}`;
}

function formatWeekNumber(iso: string) {
  const date = amsterdamDate(iso);
  if (!date) return "Week";
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day));
  const weekday = next.getUTCDay() || 7;
  next.setUTCDate(next.getUTCDate() + (weekday === 1 ? 7 : 8 - weekday));
  return `Week ${isoWeekNumber(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())}`;
}

function formatWholePercent(value: number) {
  return `${Math.floor(value + 1e-6)}%`;
}

function formatPrice(value: number) {
  if (value <= 0) return "geen dieselprijs";
  return priceFormatter.format(value);
}

function newestWeeks(weeks: DieselWeek[]) {
  return [...weeks].sort((left, right) => Date.parse(right.peildatum) - Date.parse(left.peildatum)).slice(0, 4);
}

export function DieselCard() {
  const state = useDieselSurcharge();

  if (state.status === "error") {
    return <CardState status="error" title="Dieseltoeslag" message={state.message} />;
  }
  if (state.status === "empty") {
    return <CardState status="empty" title="Dieseltoeslag" message="Geen toeslag beschikbaar." />;
  }
  if (state.status !== "ready" && state.status !== "fallback") {
    return <CardState status="loading" title="Dieseltoeslag" message="Toeslag laden." />;
  }

  const blocks = newestWeeks(state.data.weken?.length ? state.data.weken : [state.data]);

  return (
    <article className="tv-card relative flex h-full min-h-0 flex-col px-3 py-3" data-status={state.status}>
      {state.refreshing ? <span className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-gold" aria-label="Vernieuwen" /> : null}
      <ul
        className="grid min-h-0 flex-1 gap-2"
        style={{ gridTemplateRows: `repeat(${blocks.length}, minmax(0, 1fr))` }}
      >
        {blocks.map((week, index) => (
          <li
            key={`${week.peildatum}-${week.toeslagPercentage}`}
            data-week={formatWeekNumber(week.peildatum)}
            className={`grid min-h-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-xl border px-4 ${
              index === 0 ? "border-gold/45 bg-gold/8" : "border-slate/40 bg-black/25"
            }`}
          >
            <div className="min-w-0">
              <p className="font-display text-[26px] leading-none font-semibold text-gold">{formatWeekNumber(week.peildatum)}</p>
              <p className="mt-1 font-display text-[54px] leading-none font-semibold tabular-nums">
                {formatWholePercent(week.toeslagPercentage)}
              </p>
            </div>
            <div className="min-w-0 text-right">
              <p className="truncate text-[18px] leading-tight">Dieselprijs {formatPrice(week.dieselPrijs)}</p>
              <p className="mt-1 truncate text-[16px] leading-tight text-mist">Peildatum {formatPeildatum(week.peildatum)}</p>
            </div>
          </li>
        ))}
      </ul>
      {state.status === "fallback" ? (
        <p className="mt-1 truncate text-center text-[13px] text-gold">Laatste bekende gegevens</p>
      ) : null}
    </article>
  );
}
