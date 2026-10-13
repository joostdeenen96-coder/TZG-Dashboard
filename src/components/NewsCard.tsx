import { Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import { formatPublicationDate } from "../lib/format";
import { readNews } from "../services/dashboardService";
import { CardState } from "./CardState";

export function NewsCard() {
  const state = readNews();
  if (state.status === "error") {
    return <CardState status="error" title="Bedrijfsnieuws" message={state.message} />;
  }
  if (state.status === "empty") {
    return <CardState status="empty" title="Bedrijfsnieuws" message="Geen berichten." />;
  }
  if (state.status !== "ready") {
    return <CardState status="loading" title="Bedrijfsnieuws" message="Nieuws laden." />;
  }

  return (
    <motion.article
      className="tv-card flex h-full flex-col px-6 py-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-slate/40 bg-black/25 text-gold">
          <Newspaper className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <h2 className="font-display text-[32px] leading-none font-semibold tracking-wide uppercase">
          Laatste bedrijfsnieuws
        </h2>
      </div>
      <ul className="mt-3 flex min-h-0 flex-1 flex-col justify-between">
        {state.data.map((item) => (
          <li key={item.id} className="flex min-w-0 items-baseline justify-between gap-4">
            <p className="truncate text-[18px] leading-tight font-semibold">{item.title}</p>
            <p className="shrink-0 text-[15px] whitespace-nowrap text-mist">
              {formatPublicationDate(item.publishedAt)}
            </p>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
