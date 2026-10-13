import { Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import { formatPublicationDate } from "../lib/format";
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
    <li className="min-h-0 rounded-xl border border-slate/30 bg-black/20 px-4 py-3">
      <p className="text-[12px] font-semibold tracking-[0.16em] text-gold uppercase">
        {sample ? "Voorbeeld" : "WijTeunesen"}
      </p>
      <p className="mt-1 truncate text-[18px] leading-tight font-semibold">{item.title}</p>
      <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-mist">{item.summary}</p>
      {item.publishedAt ? (
        <p className="mt-1 text-[13px] text-mist">{formatPublicationDate(item.publishedAt)}</p>
      ) : null}
    </li>
  );
}

export function NewsCard() {
  const state = useWijNews();
  if (state.status === "error") {
    return <CardState status="error" title="WijTeunesen" message={state.message} />;
  }
  if (state.status !== "ready") {
    return <CardState status="loading" title="WijTeunesen" message="Nieuws laden." />;
  }

  const live = state.data.connected && state.data.items.length > 0;
  const shown = live ? state.data.items.slice(0, 3) : previews;

  return (
    <motion.article
      className="tv-card flex h-full min-h-0 flex-col px-5 py-4"
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
            <p className="mt-1 truncate text-[14px] text-mist">sites/wt-nieuws</p>
          </div>
        </div>
      </div>
      {state.data.error ? <p className="mt-2 text-[14px] text-mist">{state.data.error}</p> : null}
      <ul className="mt-3 grid min-h-0 flex-1 grid-rows-3 gap-2">
        {shown.map((item) => (
          <Preview key={item.id} item={item} sample={!live} />
        ))}
      </ul>
    </motion.article>
  );
}
