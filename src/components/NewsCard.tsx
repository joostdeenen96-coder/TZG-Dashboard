import { Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import { formatAmsterdamTime, formatPublicationDate } from "../lib/format";
import { useScreenConfig } from "../services/dashboardConfigService";
import { useWijNews } from "../services/newsService";
import type { WijNewsItem } from "../types";
import { CardState } from "./CardState";

const previews: WijNewsItem[] = [
  {
    id: "voorbeeld-titel",
    title: "Titel van het bericht",
    summary: "Hier komen de eerste regels van een nieuwsbericht op WijTeunesen.",
    publishedAt: "",
  },
  {
    id: "voorbeeld-datum",
    title: "Tweede bericht",
    summary: "Alleen nieuws van de site wt-nieuws wordt hier getoond.",
    publishedAt: "",
  },
  {
    id: "voorbeeld-koppeling",
    title: "Derde bericht",
    summary: "De koppeling gebruikt dezelfde Graph-gegevens als de dieseltoeslag.",
    publishedAt: "",
  },
];

function Preview({ item, sample }: { item: WijNewsItem; sample: boolean }) {
  return (
    <li className="flex min-h-0 flex-col justify-center overflow-hidden rounded-xl border border-slate/30 bg-black/20 px-4">
      <p className="truncate text-[18px] leading-tight font-semibold">{item.title}</p>
      <p className="truncate text-[15px] leading-snug text-mist">{item.summary}</p>
      <p className="truncate text-[13px] text-mist">{sample ? "Voorbeeld" : formatPublicationDate(item.publishedAt)}</p>
    </li>
  );
}

export function NewsCard() {
  const count = useScreenConfig().dashboard.aantalNieuwsitems;
  const state = useWijNews();
  if (state.status === "error") {
    return <CardState status="error" title="WijTeunesen" message={state.message} />;
  }
  if (state.status !== "ready" && state.status !== "fallback") {
    return <CardState status="loading" title="WijTeunesen" message="Nieuws laden." />;
  }

  const live = state.data.connected && state.data.items.length > 0;
  const shown = (live ? state.data.items : previews).slice(0, count);

  return (
    <motion.article
      className="tv-card relative flex h-full min-h-0 flex-col px-5 py-4"
      data-status={state.status}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate/40 bg-black/25 text-gold">
            <Newspaper className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[32px] leading-none font-semibold tracking-wide uppercase">WijTeunesen</h2>
            <p className={`mt-1 truncate text-[14px] ${state.status === "fallback" ? "text-gold" : "text-mist"}`}>
              {state.status === "fallback"
                ? `Laatste bekende gegevens${state.fetchedAt ? ` · ${formatAmsterdamTime(state.fetchedAt)}` : ""}`
                : state.fetchedAt
                  ? `Bijgewerkt ${formatAmsterdamTime(state.fetchedAt)}`
                  : "sites/wt-nieuws"}
            </p>
          </div>
        </div>
      </div>
      {state.refreshing ? <span className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-gold" aria-label="Vernieuwen" /> : null}
      {state.data.error ? <p className="mt-2 text-[14px] text-mist">{state.data.error}</p> : null}
      <ul
        className="mt-3 grid min-h-0 flex-1 gap-2"
        style={{ gridTemplateRows: `repeat(${Math.max(shown.length, 1)}, minmax(0, 1fr))` }}
      >
        {shown.map((item) => (
          <Preview key={item.id} item={item} sample={!live} />
        ))}
      </ul>
    </motion.article>
  );
}
