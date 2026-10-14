import { LoaderCircle } from "lucide-react";
import { formatAmsterdamStamp, formatAmsterdamTime } from "../lib/format";

type HeaderProps = {
  now: Date;
  fetchedAt: string | null;
  refreshing: boolean;
  stale: boolean;
  adminLabel: string;
  onAdmin: () => void;
};

export function Header({ now, fetchedAt, refreshing, stale, adminLabel, onAdmin }: HeaderProps) {
  const stamp = formatAmsterdamStamp(now);
  const [date, time] = stamp.split(" · ");
  const updatedClock = fetchedAt ? formatAmsterdamTime(fetchedAt) : "";
  const updatedLabel = !fetchedAt
    ? refreshing
      ? "Gegevens laden"
      : "Laatste update volgt"
    : stale
      ? `Laatste bekende gegevens ${updatedClock}`
      : `Laatste update ${updatedClock}`;

  return (
    <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-slate/30">
      <img src="/teunesen-logo.png" alt="Teunesen" className="h-[58px] w-auto" />
      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="leading-none text-paper" data-clock={stamp}>
            <span className="text-[22px]">{date}</span>
            <span className="mx-3 text-gold">·</span>
            <span className="font-display text-[40px] font-semibold tabular-nums tracking-wide">{time}</span>
          </p>
          <p
            className="mt-1.5 flex items-center justify-end gap-2 text-[16px] tracking-wide text-mist"
            data-refreshing={refreshing ? "true" : "false"}
            data-stale={stale ? "true" : "false"}
            data-updated={fetchedAt ?? ""}
          >
            {refreshing ? <LoaderCircle className="h-4 w-4 animate-spin text-gold" aria-label="Vernieuwen" /> : null}
            <span>{updatedLabel}</span>
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-[15px] font-semibold tracking-[0.12em] text-[#f0d078] uppercase"
          onClick={onAdmin}
        >
          {adminLabel}
        </button>
      </div>
    </header>
  );
}
