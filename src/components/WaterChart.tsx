import type { WaterForecastPoint, WaterPoint } from "../types";

type WaterChartProps = {
  series: WaterPoint[];
  forecast: WaterForecastPoint[];
};

const dayLabel = new Intl.DateTimeFormat("nl-NL", {
  timeZone: "Europe/Amsterdam",
  day: "numeric",
  month: "numeric",
});

function chartPath(points: WaterPoint[], xOf: (timestamp: string) => number, yOf: (levelCm: number) => number) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${xOf(point.timestamp).toFixed(1)},${yOf(point.levelCm).toFixed(1)}`)
    .join(" ");
}

export function WaterChart({ series, forecast }: WaterChartProps) {
  const measured = [...series].sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp));
  const expected = forecast
    .filter((point) => point.kind === "verwacht")
    .sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp));
  const estimated = forecast
    .filter((point) => point.kind === "inschatting")
    .sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp));
  const bridge = measured.length > 0 ? [measured[measured.length - 1], ...expected] : expected;
  const estimateBridge = expected.length > 0 ? [expected[expected.length - 1], ...estimated] : estimated;
  const all = [...measured, ...forecast];
  if (all.length < 2) {
    return <p className="px-2 text-[15px] text-mist">Geen grafiekreeks.</p>;
  }

  const width = 560;
  const height = 168;
  const pad = { left: 36, right: 8, top: 10, bottom: 22 };
  const times = all.map((point) => Date.parse(point.timestamp)).filter((value) => Number.isFinite(value));
  const levels = all.map((point) => point.levelCm).filter((value) => Number.isFinite(value));
  if (times.length < 2 || levels.length < 2) {
    return <p className="px-2 text-[15px] text-mist">Geen grafiekreeks.</p>;
  }
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  let min = Math.min(...levels);
  let max = Math.max(...levels);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const xOf = (timestamp: string) => {
    const span = Math.max(1, t1 - t0);
    return pad.left + ((Date.parse(timestamp) - t0) / span) * (width - pad.left - pad.right);
  };
  const yOf = (levelCm: number) => {
    const span = max - min;
    return height - pad.bottom - ((levelCm - min) / span) * (height - pad.top - pad.bottom);
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Waterstand en verwachting">
      <line x1={pad.left} y1={yOf(max)} x2={width - pad.right} y2={yOf(max)} stroke="rgba(147,160,174,0.25)" />
      <line x1={pad.left} y1={yOf(min)} x2={width - pad.right} y2={yOf(min)} stroke="rgba(147,160,174,0.25)" />
      <text x={4} y={yOf(max) + 4} fill="#93a0ae" fontSize="12">
        {max}
      </text>
      <text x={4} y={yOf(min) + 4} fill="#93a0ae" fontSize="12">
        {min}
      </text>
      {measured.length > 1 ? <path d={chartPath(measured, xOf, yOf)} fill="none" stroke="#9fd0ea" strokeWidth="2.4" /> : null}
      {bridge.length > 1 ? (
        <path d={chartPath(bridge, xOf, yOf)} fill="none" stroke="#e6b325" strokeWidth="2.4" strokeDasharray="6 4" />
      ) : null}
      {estimateBridge.length > 1 ? (
        <path d={chartPath(estimateBridge, xOf, yOf)} fill="none" stroke="#93a0ae" strokeWidth="2.2" strokeDasharray="2 4" />
      ) : null}
      <text x={pad.left} y={height - 4} fill="#93a0ae" fontSize="12">
        {dayLabel.format(t0)}
      </text>
      <text x={width - pad.right} y={height - 4} fill="#93a0ae" fontSize="12" textAnchor="end">
        {dayLabel.format(t1)}
      </text>
    </svg>
  );
}
