import type { DroneUiSnapshot } from "../../types/droneUi";
import { formatNumber } from "./dashboardUtils";

interface TelemetryStripProps {
  snapshot: DroneUiSnapshot;
}

export function TelemetryStrip({ snapshot }: TelemetryStripProps) {
  const fadeClass = snapshot.telemetryFresh ? "text-slate-100" : "text-slate-500";
  const cards = [
    {
      label: "BATTERY",
      value: `${formatNumber(snapshot.batteryPercent, 0)}%`,
      detail: "Power reserve",
    },
    {
      label: "ALT",
      value: `${formatNumber(snapshot.altitudeM, 1)} m`,
      detail: "Altitude",
    },
    {
      label: "Vz",
      value: `${formatNumber(snapshot.vzActualMps, 2)} m/s`,
      detail: "Vertical speed",
    },
    {
      label: "P_value",
      value: formatNumber(snapshot.pValue, 2),
      detail: "Gate authority",
    },
    {
      label: "S_gate",
      value: formatNumber(snapshot.sGate, 2),
      detail: "Safety gate",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[22px] border border-slate-800 bg-slate-950/90 p-3"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {card.label}
          </p>
          <p className={`mt-2 text-xl font-semibold tabular-nums ${fadeClass}`}>{card.value}</p>
          <p className="mt-1 text-[11px] text-slate-400">{card.detail}</p>
        </div>
      ))}
    </section>
  );
}
