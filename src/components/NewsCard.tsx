import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatPublicationDate } from "../lib/format";
import { useWijNews } from "../services/newsService";
import type { WijNewsItem } from "../types";
import { CardState } from "./CardState";

const ROTATE_MS = 20_000;

const previews: WijNewsItem[] = [
  {
    id: "voorbeeld-titel",
    title: "Titel van het bericht",
    summary: "Hier komen de eerste regels van een Nederlands nieuwsbericht op WijTeunesen.",
    publishedAt: "",
  },
  {
    id: "voorbeeld-datum",
    title: "Tweede bericht",
    summary: "Alleen Nederlandse berichten van de site wt-nieuws wisselen hier.",
    publishedAt: "",
  },
];

export function NewsCard() {
  const state = useWijNews();
  const [index, setIndex] = useState(0);
  const ready = state.status === "ready" || state.status === "fallback" ? state : null;
  const liveItems = ready?.data.connected ? ready.data.items : [];
  const sample = ready !== null && !ready.data.connected;
  const shown = (sample ? previews : liveItems).slice(0, 5);
  const rotationKey = shown.map((item) => item.id).join("|");
  const active = shown[index] ?? shown[0];

  useEffect(() => {
    setIndex(0);
  }, [rotationKey]);

  useEffect(() => {
    if (shown.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % shown.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [shown.length, rotationKey]);

  if (state.status === "error") {
    return <CardState status="error" title="WijTeunesen" message={state.message} />;
  }
  if (state.status !== "ready" && state.status !== "fallback") {
    return <CardState status="loading" title="WijTeunesen" message="Nieuws laden." />;
  }
  if (!active) {
    return <CardState status="empty" title="WijTeunesen" message="Geen Nederlandse berichten." />;
  }

  return (
    <article className="tv-card relative flex h-full min-h-0 flex-col overflow-hidden" data-status={state.status}>
      {state.refreshing ? <span className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-gold" aria-label="Vernieuwen" /> : null}
      <AnimatePresence mode="sync">
        <motion.div
          key={active.id}
          className="absolute inset-0 flex flex-col justify-center px-10 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between gap-6">
            <p className="text-[14px] font-semibold tracking-[0.28em] text-gold uppercase">WijTeunesen</p>
            <p className="font-display text-[22px] tracking-[0.18em] text-white/80 tabular-nums">
              {String((shown.indexOf(active) >= 0 ? shown.indexOf(active) : index) + 1).padStart(2, "0")} / {String(shown.length).padStart(2, "0")}
            </p>
          </div>
          <h2 className="mt-3 max-h-[1.15em] overflow-hidden font-display text-[64px] leading-none font-semibold tracking-wide">
            {active.title}
          </h2>
          <p className="mt-4 max-h-[2.6em] overflow-hidden text-[28px] leading-snug text-mist">{active.summary}</p>
          <p className={`mt-4 text-[20px] ${state.status === "fallback" ? "text-gold" : "text-mist"}`}>
            {state.status === "fallback" ? "Laatste bekende gegevens · " : ""}
            {ready?.data.connected ? formatPublicationDate(active.publishedAt) : "Voorbeeld"}
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="absolute right-0 bottom-0 left-0 z-10 h-1.5 bg-white/15">
        <div key={`${active.id}-${index}`} className="progress-bar h-full w-full bg-gold" style={{ animationDuration: `${ROTATE_MS}ms` }} />
      </div>
    </article>
  );
}
