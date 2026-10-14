import { useWijAgenda } from "./agendaService";
import { useDieselSurcharge } from "./dieselService";
import { useWijNews } from "./newsService";
import { useWaterLevels } from "./waterLevelService";
import type { QueryState } from "../types";

function stampOf(state: QueryState<unknown>) {
  return state.fetchedAt;
}

export function useTvStatus() {
  const water = useWaterLevels();
  const diesel = useDieselSurcharge();
  const news = useWijNews();
  const agenda = useWijAgenda();
  const feeds = [water, diesel, news, agenda];
  const refreshing = feeds.some((feed) => feed.refreshing);
  const anyReady = feeds.some((feed) => feed.status === "ready");
  const anyFallback = feeds.some((feed) => feed.status === "fallback");
  const fetchedAt = feeds
    .map(stampOf)
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .sort()
    .at(-1) ?? null;
  return {
    refreshing,
    stale: !anyReady && anyFallback,
    fetchedAt,
  };
}
