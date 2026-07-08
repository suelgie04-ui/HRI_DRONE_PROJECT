import type { DroneUiSnapshot } from "../../types/droneUi";
import type { DroneUiLimits } from "../../config/uiLimits";
import { clamp } from "./dashboardUtils";
import { RpDirectionPlot } from "./RpDirectionPlot";

interface RpBaselinePanelProps {
  snapshot: DroneUiSnapshot;
  limits: DroneUiLimits;
}

const baselineLabelMap: Record<DroneUiSnapshot["baselineStatus"], string> = {
  INVALID: "BASELINE INVALID",
  LOCKED: "BASELINE LOCKED",
  UPDATE_ALLOWED: "UPDATE ALLOWED",
  HOLDING: "HOLDING",
  UPDATING: "UPDATING",
};

export function RpBaselinePanel({ snapshot, limits }: RpBaselinePanelProps) {
  const deviationRatio = clamp(snapshot.thetaSwingRelRad / limits.rpDeviationDisplayMaxRad, 0, 1);
  const neutralWidth = Math.min(100, (limits.rpNeutralBandRad / limits.rpDeviationDisplayMaxRad) * 100);
  const warningWidth = Math.min(100 - neutralWidth, ((limits.rpWarningRad - limits.rpNeutralBandRad) / limits.rpDeviationDisplayMaxRad) * 100);
  const highWidth = Math.max(0, 100 - neutralWidth - warningWidth);
  const markerLeft = `${deviationRatio * 100}%`;

  return (
    <section className="rounded-[24px] border border-slate-800 bg-slate-950/90 p-4">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                RP Baseline Deviation
              </p>
              <p className="mt-2 text-lg font-semibold text-white tabular-nums">
                {snapshot.thetaSwingRelRad.toFixed(3)} rad
              </p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">
              {baselineLabelMap[snapshot.baselineStatus]}
            </span>
          </div>

          <div className="mt-4 rounded-3xl bg-slate-900 p-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-slate-500">
              <span>0 / baseline</span>
              <span>{limits.rpDeviationDisplayMaxRad.toFixed(2)} rad</span>
            </div>
            <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="absolute left-0 top-0 h-full bg-emerald-500/20" style={{ width: `${neutralWidth}%` }} />
              <div
                className="absolute top-0 h-full bg-amber-500/20"
                style={{ width: `${warningWidth}%`, left: `${neutralWidth}%` }}
              />
              <div
                className="absolute top-0 h-full bg-rose-500/20"
                style={{ width: `${highWidth}%`, left: `${neutralWidth + warningWidth}%` }}
              />
              <div className="absolute inset-y-0 left-0 h-full w-full">
                <div
                  className="absolute top-0 h-3 w-0.5 bg-white"
                  style={{ left: markerLeft }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2 text-[11px] text-slate-400">
            <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">
              {snapshot.thetaSwingRelRad <= limits.rpNeutralBandRad ? "NEAR BASELINE" : "DEVIATION"}
            </span>
            <span>neutral band</span>
          </div>
        </div>

        <RpDirectionPlot snapshot={snapshot} limits={limits} />
      </div>
    </section>
  );
}
