import { Newspaper } from "lucide-react";
import { formatRelativeDutch } from "../lib/format";
import { getNews } from "../services/dashboardService";

type NewsCardProps = {
  now: Date;
};

export function NewsCard({ now }: NewsCardProps) {
  const visible = getNews().slice(0, 4);

  return (
    <article className="tv-card flex h-full flex-col px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-teune/15 text-sprout">
          <Newspaper className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <h2 className="font-display text-[32px] font-semibold uppercase leading-none tracking-wide">
          Laatste bedrijfsnieuws
        </h2>
      </div>
      <ul className="mt-3 flex min-h-0 flex-1 flex-col justify-between">
        {visible.map((item) => (
          <li key={item.id} className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <p className="truncate text-[19px] leading-tight font-semibold">{item.title}</p>
              <p className="shrink-0 font-display text-[18px] leading-none font-semibold tracking-wide whitespace-nowrap text-sprout">
                {formatRelativeDutch(item.publishedAt, now)}
              </p>
            </div>
            <p className="mt-0.5 truncate text-[16px] leading-snug text-mist">{item.summary}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
