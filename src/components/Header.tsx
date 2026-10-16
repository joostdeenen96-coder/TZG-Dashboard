import { Cloud, CloudDrizzle, CloudRain, CloudSun, Droplet, LoaderCircle, Moon, Sun } from "lucide-react";
import { useDisplayPrefs } from "../hooks/useDisplayPrefs";
import { formatAmsterdamStamp, formatAmsterdamTime } from "../lib/format";
import { readWeather } from "../services/dashboardService";
import { useScreenConfig } from "../services/dashboardConfigService";
import type { WeatherIconName } from "../types";

type HeaderProps = {
  now: Date;
  fetchedAt: string | null;
  refreshing: boolean;
  stale: boolean;
  adminLabel: string;
  onAdmin: () => void;
};

const weatherIcons = {
  cloud: Cloud,
  rain: CloudRain,
  showers: CloudDrizzle,
  sun: Sun,
  "sun-cloud": CloudSun,
} satisfies Record<WeatherIconName, typeof Cloud>;

function HeaderWeather() {
  const plaatsnaam = useScreenConfig().weer.plaatsnaam;
  const state = readWeather();
  if (state.status !== "ready") return null;
  const weather = state.data;
  const Icon = weatherIcons[weather.icon];
  return (
    <div className="flex items-center gap-3 border-r border-veil/12 pr-5" aria-label="Weerbericht">
      <Icon className="h-8 w-8 shrink-0 text-gold" strokeWidth={2.1} />
      <div className="min-w-0 leading-none">
        <p className="font-display text-[34px] font-semibold tabular-nums">{weather.temperatureC}°</p>
        <p className="mt-1 max-w-[240px] truncate text-[15px] text-mist">
          {weather.condition} · {plaatsnaam || weather.location}
        </p>
      </div>
    </div>
  );
}

function DisplayToggles() {
  const { prefs, toggleTheme, toggleGlass } = useDisplayPrefs();
  const ThemeIcon = prefs.theme === "dark" ? Moon : Sun;
  const button =
    "grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 ease-out hover:bg-veil/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-veil/12 bg-veil/[0.05] p-0.5" aria-label="Weergave">
      <button
        type="button"
        className={`${button} ${prefs.glass ? "text-gold" : "text-mist"}`}
        aria-pressed={prefs.glass}
        aria-label={prefs.glass ? "Liquid glass uitzetten" : "Liquid glass aanzetten"}
        title={prefs.glass ? "Liquid glass aan" : "Liquid glass uit"}
        onClick={toggleGlass}
      >
        <Droplet className="h-[18px] w-[18px]" strokeWidth={1.8} fill={prefs.glass ? "currentColor" : "none"} fillOpacity={0.25} />
      </button>
      <button
        type="button"
        className={`${button} text-mist`}
        aria-label={prefs.theme === "dark" ? "Licht thema" : "Donker thema"}
        title={prefs.theme === "dark" ? "Donker thema" : "Licht thema"}
        onClick={toggleTheme}
      >
        <ThemeIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>
    </div>
  );
}

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
    <header className="glass-pill flex h-[78px] shrink-0 items-center justify-between pr-3 pl-8">
      <img src="/teunesen-logo.png" alt="Teunesen" className="h-[52px] w-auto" />
      <div className="flex items-center gap-5">
        <HeaderWeather />
        <div className="text-right">
          <p className="leading-none text-paper" data-clock={stamp}>
            <span className="text-[22px]">{date}</span>
            <span className="mx-3 text-gold">·</span>
            <span className="font-display text-[40px] font-semibold tabular-nums tracking-[-0.01em]">{time}</span>
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
        <DisplayToggles />
        <button
          type="button"
          className="rounded-full border border-veil/20 bg-veil/10 px-5 py-2.5 text-[15px] font-bold tracking-[0.02em] text-paper uppercase"
          onClick={onAdmin}
        >
          {adminLabel}
        </button>
      </div>
    </header>
  );
}
