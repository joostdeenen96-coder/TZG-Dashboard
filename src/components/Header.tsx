import { formatAmsterdamStamp, formatAmsterdamTime } from "../lib/format";

type HeaderProps = {
  now: Date;
  updatedAt: string | null;
};

export function Header({ now, updatedAt }: HeaderProps) {
  const stamp = formatAmsterdamStamp(now);
  const [date, time] = stamp.split(" · ");
  const updatedLabel = updatedAt ? `Laatste update ${formatAmsterdamTime(updatedAt)}` : "Laatste update volgt";

  return (
    <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-slate/30">
      <img src="/teunesen-logo.png" alt="Teunesen" className="h-[58px] w-auto" />
      <div className="text-right">
        <p className="leading-none text-paper" data-clock={stamp}>
          <span className="text-[22px]">{date}</span>
          <span className="mx-3 text-gold">·</span>
          <span className="font-display text-[40px] font-semibold tabular-nums tracking-wide">{time}</span>
        </p>
        <p className="mt-1.5 text-[16px] tracking-wide text-mist">{updatedLabel}</p>
      </div>
    </header>
  );
}
