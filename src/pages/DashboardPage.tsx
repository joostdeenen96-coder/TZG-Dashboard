import { useEffect, useState } from "react";
import { CardState } from "../components/CardState";
import { DieselCard } from "../components/DieselCard";
import { Header } from "../components/Header";
import { NewsCard } from "../components/NewsCard";
import { SlideshowCard } from "../components/SlideshowCard";
import { WaterLevelCard } from "../components/WaterLevelCard";
import { WeatherCard } from "../components/WeatherCard";
import { useAmsterdamNow } from "../hooks/useAmsterdamNow";
import { useWaterLevels } from "../services/waterLevelService";

const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;

function readScale() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
}

export function DashboardPage() {
  const now = useAmsterdamNow();
  const [scale, setScale] = useState(readScale);
  const water = useWaterLevels();
  const updatedAt = water.status === "ready" ? (water.data[0]?.updatedAt ?? null) : null;

  useEffect(() => {
    const update = () => setScale(readScale());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="grid h-screen w-screen place-items-center overflow-hidden bg-ink">
      <div className="relative overflow-hidden" style={{ width: STAGE_WIDTH * scale, height: STAGE_HEIGHT * scale }}>
        <div
          className="absolute top-0 left-0 box-border flex h-[1080px] w-[1920px] origin-top-left flex-col gap-3 bg-ink p-4"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(880px_240px_at_0%_0%,rgba(230,179,37,0.12),transparent_60%),radial-gradient(720px_280px_at_100%_0%,rgba(109,127,146,0.16),transparent_58%)]" />
          <div className="relative flex min-h-0 flex-1 flex-col gap-3">
            <Header now={now} updatedAt={updatedAt} />
            <section className="grid h-[228px] shrink-0 grid-cols-4 gap-3">
              {water.status === "loading" ? (
                <CardState className="col-span-3" status="loading" title="Waterstanden" message="Peilen worden opgehaald." />
              ) : null}
              {water.status === "error" ? (
                <CardState className="col-span-3" status="error" title="Waterstanden" message={water.message} />
              ) : null}
              {water.status === "empty" ? (
                <CardState className="col-span-3" status="empty" title="Waterstanden" message="Geen peilgegevens." />
              ) : null}
              {water.status === "ready"
                ? water.data.map((reading, index) => (
                    <WaterLevelCard key={reading.id} reading={reading} delay={index * 0.05} />
                  ))
                : null}
              <DieselCard />
            </section>
            <section className="grid h-[252px] shrink-0 grid-cols-[3fr_2fr] gap-3">
              <WeatherCard />
              <NewsCard />
            </section>
            <section className="min-h-0 flex-1">
              <SlideshowCard />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
