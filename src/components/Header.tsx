import { formatAmsterdamStamp } from "../lib/format";

type HeaderProps = {
  now: Date;
};

function TeunesenWordmark() {
  return (
    <svg
      viewBox="0 0 268 56"
      className="h-[52px] w-auto"
      role="img"
      aria-label="Teunesen"
    >
      <rect width="48" height="48" y="4" rx="12" fill="#1F6B34" />
      <rect x="10" y="14" width="28" height="5" rx="1.5" fill="#C6E7BA" />
      <rect x="10" y="24" width="22" height="5" rx="1.5" fill="#3D9B4F" />
      <rect x="10" y="34" width="16" height="5" rx="1.5" fill="#F4F7F4" />
      <text
        x="62"
        y="40"
        fill="#F3F6F4"
        fontFamily="Barlow Condensed, sans-serif"
        fontSize="44"
        fontWeight="600"
        letterSpacing="0.4"
      >
        Teunesen
      </text>
    </svg>
  );
}

export function Header({ now }: HeaderProps) {
  const stamp = formatAmsterdamStamp(now);
  const [date, time] = stamp.split(" · ");

  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between">
      <div className="flex items-end gap-4">
        <TeunesenWordmark />
        <p className="mb-1.5 text-[15px] font-semibold uppercase tracking-[0.22em] text-mist">
          Grond · Infra · Zand &amp; grind
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teune opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teune" />
        </span>
        <p className="text-[26px] leading-none text-paper" data-clock={stamp}>
          <span>{date}</span>
          <span className="mx-3 text-sprout">·</span>
          <span className="font-display text-[40px] font-semibold tabular-nums tracking-wide">
            {time}
          </span>
        </p>
      </div>
    </header>
  );
}
