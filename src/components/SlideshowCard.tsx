import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getSlideIntervalMs, readSlides } from "../services/dashboardService";
import { CardState } from "./CardState";

export function SlideshowCard() {
  const state = readSlides();
  const intervalMs = getSlideIntervalMs();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const slides = state.status === "ready" ? state.data : [];

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [index, intervalMs, slides.length]);

  if (state.status === "error") {
    return <CardState status="error" title="Projecten" message={state.message} />;
  }
  if (state.status === "empty") {
    return <CardState status="empty" title="Projecten" message="Geen projectfoto's." />;
  }
  if (state.status !== "ready") {
    return <CardState status="loading" title="Projecten" message="Foto's laden." />;
  }

  const active = slides[index];
  if (!active) {
    return <CardState status="empty" title="Projecten" message="Geen projectfoto's." />;
  }

  const broken = failed[active.id] === true;

  return (
    <section
      className="tv-card relative h-full"
      aria-roledescription="carrousel"
      aria-label="Projectfoto's"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={active.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${active.gradient}`} />
          {broken ? null : (
            <img
              src={active.url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: active.objectPosition }}
              onError={() => setFailed((current) => ({ ...current, [active.id]: true }))}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
      <div className="absolute top-5 right-6 z-30 font-display text-[22px] tracking-[0.18em] text-white/80 tabular-nums">
        {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
      <div className="absolute right-6 bottom-8 left-7 z-30 flex items-end justify-between gap-8">
        <div>
          <p className="text-[14px] font-semibold tracking-[0.28em] text-gold uppercase">Project</p>
          <h2 className="mt-1 font-display text-[52px] leading-none font-semibold tracking-wide">{active.title}</h2>
          <p className="mt-2 flex items-center gap-2 text-[20px] text-white/90">
            <MapPin className="h-5 w-5 text-gold" strokeWidth={2.2} />
            {active.location}
          </p>
        </div>
        <div className="mb-2 flex items-center gap-2.5">
          {slides.map((project, dotIndex) => (
            <button
              key={project.id}
              type="button"
              aria-label={`${project.title}, ${project.location}`}
              aria-current={dotIndex === index}
              onClick={() => setIndex(dotIndex)}
              className={`h-2.5 rounded-full transition-all ${dotIndex === index ? "w-8 bg-gold" : "w-2.5 bg-white/45"}`}
            />
          ))}
        </div>
      </div>
      <div className="absolute right-0 bottom-0 left-0 z-30 h-1.5 bg-white/15">
        <div key={index} className="progress-bar h-full w-full bg-gold" style={{ animationDuration: `${intervalMs}ms` }} />
      </div>
    </section>
  );
}
