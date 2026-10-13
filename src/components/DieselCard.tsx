import { formatDutchPercent, formatEuro, formatPublicationDate } from "../lib/format";
import { useDieselSurcharge } from "../services/dieselService";
import { CardState } from "./CardState";
import { KpiCard } from "./KpiCard";

function formatPeildatum(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return formatPublicationDate(value);
}

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
  const priceLabel = surcharge.dieselPrijs > 0 ? `dieselprijs ${formatEuro(surcharge.dieselPrijs)}` : "geen dieselprijs";
  return (
    <KpiCard
      title="Dieseltoeslag"
      eyebrow="Asvervoer"
      value={formatDutchPercent(surcharge.toeslagPercentage)}
      unit="%"
      status={surcharge.actief ? "actief" : "inactief"}
      tone="gold"
      delta={priceLabel}
      updatedLabel={`Peildatum ${formatPeildatum(surcharge.peildatum)}`}
      delay={0.12}
    />
  );
}
