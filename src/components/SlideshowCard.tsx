import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getSlideIntervalMs, getSlides } from "../services/dashboardService";

export function SlideshowCard() {
  const slides = getSlides();
  const intervalMs = getSlideIntervalMs();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [index, intervalMs, slides.length]);

  const active = slides[index];

  return (
    <section
      className="tv-card relative h-full overflow-hidden"
      aria-roledescription="carrousel"
      aria-label="Projectfoto's"
    >
      {slides.map((project, slideIndex) => {
        const visible = slideIndex === index;
        const broken = failed[project.id] === true;
        return (
          <div
            key={project.id}
            className={`absolute inset-0 transition-opacity duration-700 ${visible ? "z-10 opacity-100" : "z-0 opacity-0"}`}
            aria-hidden={!visible}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`} />
            <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(135deg,transparent,transparent_18px,rgba(255,255,255,0.04)_18px,rgba(255,255,255,0.04)_19px)]" />
            {broken ? null : (
              <img
                src={project.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: project.objectPosition }}
                onError={() =>
                  setFailed((current) => ({ ...current, [project.id]: true }))
                }
              />
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/15 to-black/25" />

      <div className="absolute top-5 right-6 z-30 font-display text-[22px] tracking-[0.18em] text-white/80 tabular-nums">
        {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>

      {active ? (
        <div className="absolute right-6 bottom-8 left-7 z-30 flex items-end justify-between gap-8">
          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.28em] text-sprout">
              Project
            </p>
            <h2 className="mt-1 font-display text-[52px] leading-none font-semibold tracking-wide">
              {active.title}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-[20px] text-white/90">
              <MapPin className="h-5 w-5 text-sprout" strokeWidth={2.2} />
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
                className={`h-2.5 rounded-full transition-all ${
                  dotIndex === index ? "w-8 bg-teune" : "w-2.5 bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="absolute right-0 bottom-0 left-0 z-30 h-1.5 bg-white/15">
        <div
          key={index}
          className="progress-bar h-full w-full bg-teune"
          style={{ animationDuration: `${intervalMs}ms` }}
        />
      </div>
    </section>
  );
}
