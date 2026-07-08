import type { DroneUiSnapshot } from "../../types/droneUi";

interface StatusHeaderProps {
  snapshot: DroneUiSnapshot;
}

function getBadgeTone(permission: DroneUiSnapshot["forwardingPermission"]) {
  return permission === "ENGAGED"
    ? "bg-emerald-500/15 text-emerald-300"
    : "bg-amber-500/15 text-amber-300";
}

function getVideoTone(connected: boolean) {
  return connected
    ? "bg-emerald-500/15 text-emerald-300"
    : "bg-rose-500/15 text-rose-300";
}

export function StatusHeader({ snapshot }: StatusHeaderProps) {
  return (
    <section className="rounded-[24px] border border-slate-800 bg-slate-950/90 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${getBadgeTone(snapshot.forwardingPermission)}`}>
          {snapshot.forwardingPermission}
        </span>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
            OPERATING STATE
          </p>
          <p className="mt-2 text-xl font-semibold uppercase tracking-[0.16em] text-white">
            {snapshot.operatingState.replace(/_/g, " ")}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${getVideoTone(snapshot.videoConnected)}`}>
            {snapshot.videoConnected ? `Video OK · ${snapshot.videoLatencyMs} ms` : "Video Lost"}
          </span>
        </div>
      </div>

      {!snapshot.telemetryFresh ? (
        <div className="mt-4 rounded-[20px] border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-100">
          TELEMETRY STALE
        </div>
      ) : null}
    </section>
  );
}
