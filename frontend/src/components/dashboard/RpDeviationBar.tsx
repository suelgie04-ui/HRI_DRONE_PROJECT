import type { DroneUiSnapshot } from "../../types/droneUi";
import type { DroneUiLimits } from "../../config/uiLimits";

interface RpDeviationBarProps {
  snapshot: DroneUiSnapshot;
  limits: DroneUiLimits;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function RpDeviationBar({ snapshot, limits }: RpDeviationBarProps) {
  const ratio = clamp(snapshot.thetaSwingRelRad / limits.rpDeviationDisplayMaxRad, 0, 1);
  const statusLabel =
    snapshot.thetaSwingRelRad <= limits.rpNeutralBandRad
      ? "NEAR BASELINE"
      : "DEVIATION";
  const markerLeft = `${ratio * 100}%`;
  const neutralWidth = Math.min(
    100,
    (limits.rpNeutralBandRad / limits.rpDeviationDisplayMaxRad) * 100,
  );
  const warningWidth = Math.min(
    100 - neutralWidth,
    ((limits.rpWarningRad - limits.rpNeutralBandRad) / limits.rpDeviationDisplayMaxRad) * 100,
  );
  const highWidth = Math.max(0, 100 - neutralWidth - warningWidth);

  return (
    <div className="rounded-[22px] border border-slate-800 bg-slate-950/90 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            RP Deviation
          </p>
          <p className="mt-2 text-base font-semibold text-white tabular-nums">
            {snapshot.thetaSwingRelRad.toFixed(3)} rad
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-emerald-500/20" style={{ width: `${neutralWidth}%` }} />
        <div
          className="h-full bg-amber-500/20"
          style={{ width: `${warningWidth}%` }}
        />
        <div className="h-full bg-rose-500/20" style={{ width: `${highWidth}%` }} />
        <div
          className="absolute left-0 top-0 h-3 w-full"
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="absolute top-0 h-3 w-0.5 bg-white"
            style={{ left: markerLeft }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>0 baseline</span>
        <span>{limits.rpDeviationDisplayMaxRad.toFixed(2)} rad</span>
      </div>
    </div>
  );
}
