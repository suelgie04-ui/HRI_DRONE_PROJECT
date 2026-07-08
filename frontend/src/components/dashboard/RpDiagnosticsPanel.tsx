import type { DroneUiSnapshot } from "../../types/droneUi";
import { formatPercent, formatSigned } from "./dashboardUtils";
import { RpInitializationCard } from "./RpInitializationCard";

interface RpDiagnosticsPanelProps {
  snapshot: DroneUiSnapshot;
}

export function RpDiagnosticsPanel({ snapshot }: RpDiagnosticsPanelProps) {
  return (
    <section className="rounded-[24px] border border-slate-800 bg-slate-950/90 p-3">
      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
        RP Performance Diagnostics
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <RpInitializationCard snapshot={snapshot} />
        <div className="rounded-[22px] border border-slate-800 bg-slate-950/90 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            ENTRY PROGRESS
          </p>
          <p className="mt-2 text-lg font-semibold text-white tabular-nums">
            {formatPercent(snapshot.entryProgress)}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${Math.max(0, Math.min(100, snapshot.entryProgress * 100))}%` }}
            />
          </div>
        </div>
        <div className="rounded-[22px] border border-slate-800 bg-slate-950/90 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            ACTUAL ROLL RATE
          </p>
          <p className="mt-2 text-lg font-semibold text-emerald-300 tabular-nums">
            {formatSigned(snapshot.actualRollRateRadS, 2)} rad/s
          </p>
        </div>
        <div className="rounded-[22px] border border-slate-800 bg-slate-950/90 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            ACTUAL PITCH RATE
          </p>
          <p className="mt-2 text-lg font-semibold text-cyan-300 tabular-nums">
            {formatSigned(snapshot.actualPitchRateRadS, 2)} rad/s
          </p>
        </div>
      </div>
    </section>
  );
}
