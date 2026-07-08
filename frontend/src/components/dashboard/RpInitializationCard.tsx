import type { DroneUiSnapshot } from "../../types/droneUi";
import { clamp, formatPercent } from "./dashboardUtils";

interface RpInitializationCardProps {
  snapshot: DroneUiSnapshot;
}

const stateLabels: Record<DroneUiSnapshot["rpInitState"], { title: string; subtitle: string }> = {
  NOT_STARTED: { title: "RP INITIALIZATION", subtitle: "NOT STARTED" },
  INITIALIZING: { title: "RP INITIALIZING", subtitle: "IN PROGRESS" },
  SUCCEEDED: { title: "RP INITIALIZED", subtitle: "READY" },
  FAILED: { title: "RP INIT FAILED", subtitle: "CHECK DETAILS" },
};

const failureText: Record<DroneUiSnapshot["rpInitFailureReason"], string> = {
  NONE: "",
  INSUFFICIENT_DATA: "INSUFFICIENT DATA",
  HIGH_STD: "HIGH STD",
  INVALID_DATA: "INVALID DATA",
  TIMEOUT: "TIMEOUT",
};

export function RpInitializationCard({ snapshot }: RpInitializationCardProps) {
  const progress = clamp(snapshot.rpInitProgress, 0, 1);
  const stateInfo = stateLabels[snapshot.rpInitState];
  const failureLabel = snapshot.rpInitState === "FAILED" ? failureText[snapshot.rpInitFailureReason] : "";

  return (
    <div className="rounded-[22px] border border-slate-800 bg-slate-950/90 p-4">
      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
        {stateInfo.title}
      </p>
      <p className="mt-2 text-lg font-semibold text-white tabular-nums">
        {stateInfo.subtitle}
      </p>
      {failureLabel ? (
        <p className="mt-2 text-sm text-rose-300">{failureLabel}</p>
      ) : null}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>Progress</span>
        <span>{formatPercent(progress)}</span>
      </div>
    </div>
  );
}
