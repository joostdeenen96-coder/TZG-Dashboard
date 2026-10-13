import { formatAmsterdamStamp, formatAmsterdamTime } from "../lib/format";

type HeaderProps = {
  now: Date;
  updatedAt: string | null;
  adminLabel: string;
  onAdmin: () => void;
};

export function Header({ now, updatedAt, adminLabel, onAdmin }: HeaderProps) {
  const stamp = formatAmsterdamStamp(now);
  const [date, time] = stamp.split(" · ");
  const updatedLabel = updatedAt ? `Laatste update ${formatAmsterdamTime(updatedAt)}` : "Laatste update volgt";

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
          <p className="mt-1.5 text-[16px] tracking-wide text-mist">{updatedLabel}</p>
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
