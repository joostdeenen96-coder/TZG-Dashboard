import { formatAmsterdamTime, formatDieselChange, formatDutchPercent } from "../lib/format";
import { useDieselSurcharge } from "../services/dieselService";
import { CardState } from "./CardState";
import { KpiCard } from "./KpiCard";

export function DieselCard() {
  const state = useDieselSurcharge();

  if (state.status === "error") {
    return <CardState status="error" title="Dieseltoeslag" message={state.message} />;
  }
  if (state.status === "empty") {
    return <CardState status="empty" title="Dieseltoeslag" message="Geen toeslag beschikbaar." />;
  }
  if (state.status !== "ready") {
    return <CardState status="loading" title="Dieseltoeslag" message="Toeslag laden." />;
  }

  const surcharge = state.data;
  return (
    <KpiCard
      title="Dieseltoeslag"
      eyebrow={surcharge.note}
      value={formatDutchPercent(surcharge.percentage)}
      unit="%"
      status={surcharge.status}
      tone="gold"
      trend={surcharge.trend}
      delta={formatDieselChange(surcharge.changePoints)}
      updatedLabel={`Bijgewerkt ${formatAmsterdamTime(surcharge.updatedAt)} · ${surcharge.periodLabel}`}
      delay={0.12}
    />
  );
}
