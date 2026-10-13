import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { motion } from "framer-motion";
import type { WaterTrend } from "../types";

type KpiTone = "laag" | "normaal" | "hoog" | "gold";

type KpiCardProps = {
  title: string;
  eyebrow: string;
  value: string;
  unit: string;
  status: string;
  tone: KpiTone;
  trend: WaterTrend;
  delta: string;
  updatedLabel: string;
  delay?: number;
};

const toneClass: Record<KpiTone, string> = {
  laag: "border-[#e6b325]/45 bg-[#e6b325]/12 text-[#f0d078]",
  normaal: "border-slate/50 bg-slate/20 text-[#d5dee8]",
  hoog: "border-[#f4f7fb]/30 bg-[#f4f7fb]/10 text-[#f4f7fb]",
  gold: "border-gold/45 bg-gold/12 text-[#f0d078]",
};

const railClass: Record<KpiTone, string> = {
  laag: "bg-gold",
  normaal: "bg-slate",
  hoog: "bg-[#d5dee8]",
  gold: "bg-gold",
};

export function KpiCard({
  title,
  eyebrow,
  value,
  unit,
  status,
  tone,
  trend,
  delta,
  updatedLabel,
  delay = 0,
}: KpiCardProps) {
  const TrendIcon = trend === "stijgend" ? ArrowUp : trend === "dalend" ? ArrowDown : Minus;

  return (
    <motion.article
      className="tv-card relative flex h-full flex-col px-5 py-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${railClass[tone]}`} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <h2 className="truncate font-display text-[32px] leading-none font-semibold tracking-wide uppercase">
            {title}
          </h2>
          <p className="mt-1 text-[14px] font-medium tracking-[0.14em] text-mist uppercase">{eyebrow}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[14px] font-semibold tracking-[0.12em] uppercase ${toneClass[tone]}`}
        >
          {status}
        </span>
      </div>
      <div className="mt-auto pl-2">
        <p className="flex items-end gap-2 font-display leading-none">
          <span className="text-[76px] font-semibold tabular-nums">{value}</span>
          <span className="mb-1 text-[22px] font-medium text-mist">{unit}</span>
        </p>
        <p className="mt-2 flex items-center gap-2 text-[17px] font-medium text-paper">
          <TrendIcon className="h-4 w-4 text-gold" strokeWidth={2.4} />
          <span className="text-gold">{trend}</span>
          <span className="text-mist">{delta}</span>
        </p>
        <p className="mt-1 truncate text-[15px] text-mist">{updatedLabel}</p>
      </div>
    </motion.article>
  );
}
