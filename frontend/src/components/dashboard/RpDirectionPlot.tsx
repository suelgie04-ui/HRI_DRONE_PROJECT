import type { DroneUiSnapshot } from "../../types/droneUi";
import type { DroneUiLimits } from "../../config/uiLimits";

interface RpDirectionPlotProps {
  snapshot: DroneUiSnapshot;
  limits: DroneUiLimits;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function RpDirectionPlot({ snapshot, limits }: RpDirectionPlotProps) {
  const xRatio = clamp(
    snapshot.swingLateralRad / limits.rpDirectionDisplayMaxRad,
    -1,
    1,
  );
  const yRatio = clamp(
    snapshot.swingVerticalRad / limits.rpDirectionDisplayMaxRad,
    -1,
    1,
  );
  const left = `${50 + xRatio * 50}%`;
  const top = `${50 + yRatio * 50}%`;

  return (
    <div className="rounded-[22px] border border-slate-800 bg-slate-950/90 p-3">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            RP Direction
          </p>
          <p className="mt-2 text-sm font-semibold text-white">Roll / Pitch</p>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <div>Roll {snapshot.swingLateralRad >= 0 ? "+" : ""}{snapshot.swingLateralRad.toFixed(2)} rad</div>
          <div>Pitch {snapshot.swingVerticalRad >= 0 ? "+" : ""}{snapshot.swingVerticalRad.toFixed(2)} rad</div>
        </div>
      </div>

      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-900">
        <div className="absolute inset-0 grid grid-cols-3">
          <div className="border-r border-slate-800" />
          <div className="border-r border-slate-800" />
          <div />
        </div>
        <div className="absolute inset-0 grid grid-rows-3">
          <div />
          <div className="border-t border-slate-800" />
          <div className="border-t border-slate-800" />
        </div>
        <div
          className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 bg-slate-700"
          aria-hidden="true"
        />
        <div
          className="absolute left-1/2 top-1/2 h-full w-0.5 -translate-x-1/2 -translate-y-1/2 bg-slate-700"
          aria-hidden="true"
        />
        <div
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.12)]"
          style={{ left, top }}
        />
      </div>
    </div>
  );
}
