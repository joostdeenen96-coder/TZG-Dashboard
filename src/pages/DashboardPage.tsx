import { useEffect, useRef, useState } from "react";
import { AdminPanel } from "../components/AdminPanel";
import { AgendaBar } from "../components/AgendaBar";
import { CardState } from "../components/CardState";
import { DieselCard } from "../components/DieselCard";
import { Header } from "../components/Header";
import { NewsCard } from "../components/NewsCard";
import { WaterLevelCard } from "../components/WaterLevelCard";
import { WidgetBoundary } from "../components/WidgetBoundary";
import { useAmsterdamNow } from "../hooks/useAmsterdamNow";
import { clearScreenReloadGuard } from "../components/ScreenGuard";
import { useAdminSession } from "../services/adminService";
import { useTvStatus } from "../services/tvStatus";
import { useWaterLevels } from "../services/waterLevelService";

const STAGE_WIDTH = 2560;
const STAGE_HEIGHT = 1440;

function readScale(width: number, height: number) {
  if (width < 1 || height < 1) return 1;
  return Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT);
}

export function DashboardPage() {
  const now = useAmsterdamNow();
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const water = useWaterLevels();
  const tv = useTvStatus();
  const authenticated = useAdminSession();
  const [adminOpen, setAdminOpen] = useState(false);
  const levels = water.status === "ready" || water.status === "fallback" ? water.data : null;

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const update = () => {
      const rect = element.getBoundingClientRect();
      setScale(readScale(rect.width, rect.height));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => clearScreenReloadGuard(), 20_000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div ref={frame} className="fixed inset-0 grid place-items-center overflow-hidden bg-ink">
      <div className="relative overflow-hidden" style={{ width: STAGE_WIDTH * scale, height: STAGE_HEIGHT * scale }}>
        <div
          className="absolute top-0 left-0 box-border flex h-[1440px] w-[2560px] origin-top-left flex-col gap-4 bg-ink p-5"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(880px_240px_at_0%_0%,rgba(230,179,37,0.12),transparent_60%),radial-gradient(720px_280px_at_100%_0%,rgba(109,127,146,0.16),transparent_58%)]" />
          <div className="relative flex min-h-0 flex-1 flex-col gap-3">
            <Header
              now={now}
              fetchedAt={tv.fetchedAt}
              refreshing={tv.refreshing}
              stale={tv.stale}
              adminLabel={authenticated ? "Instellingen" : "Inloggen"}
              onAdmin={() => setAdminOpen(true)}
            />
            <section className="grid h-[640px] shrink-0 grid-cols-4 gap-4">
              {levels ? (
                <>
                  <WidgetBoundary title={levels.maxau.name}>
                    <WaterLevelCard station={levels.maxau} refreshing={water.refreshing} stale={water.status === "fallback"} />
                  </WidgetBoundary>
                  <WidgetBoundary title={levels.kaub.name}>
                    <WaterLevelCard station={levels.kaub} refreshing={water.refreshing} stale={water.status === "fallback"} />
                  </WidgetBoundary>
                  <WidgetBoundary title={levels.ruhrort.name}>
                    <WaterLevelCard station={levels.ruhrort} refreshing={water.refreshing} stale={water.status === "fallback"} />
                  </WidgetBoundary>
                </>
              ) : (
                <WidgetBoundary title="Waterstanden" className="col-span-3">
                  <CardState
                    className="h-full"
                    status={water.status === "error" ? "error" : water.status === "empty" ? "empty" : "loading"}
                    title="Waterstanden"
                    message={
                      water.status === "error"
                        ? water.message
                        : water.status === "empty"
                          ? "Geen peilgegevens."
                          : "Peilen worden opgehaald."
                    }
                  />
                </WidgetBoundary>
              )}
              <WidgetBoundary title="Dieseltoeslag">
                <DieselCard />
              </WidgetBoundary>
            </section>
            <section className="min-h-0 flex-1">
              <WidgetBoundary title="WijTeunesen">
                <NewsCard />
              </WidgetBoundary>
            </section>
            <section className="h-[118px] shrink-0">
              <WidgetBoundary title="Agenda">
                <AgendaBar />
              </WidgetBoundary>
            </section>
            {adminOpen ? <AdminPanel authenticated={authenticated} onClose={() => setAdminOpen(false)} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
