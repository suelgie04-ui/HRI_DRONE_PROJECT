import type { DroneUiSnapshot } from "../../types/droneUi";
import type { DroneUiLimits } from "../../config/uiLimits";
import { clamp, formatNumber, formatSigned } from "./dashboardUtils";

interface FlexZPanelProps {
  snapshot: DroneUiSnapshot;
  limits: DroneUiLimits;
}

export function FlexZPanel({ snapshot, limits }: FlexZPanelProps) {
  const flexRatio = clamp(
    (snapshot.flexOffsetNorm - limits.flexDisplayMinNorm) /
      (limits.flexDisplayMaxNorm - limits.flexDisplayMinNorm),
    0,
    1,
  );

  return (
    <div className="rounded-[24px] border border-slate-800 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Flex / Z Intent
          </p>
          <p className="mt-2 text-sm text-slate-300">Flex offset</p>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <div>
            Vz target {formatSigned(snapshot.vzTargetMps, 2)} m/s
          </div>
          <div>S_F {formatNumber(snapshot.sF, 2)}</div>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-slate-800 bg-slate-900 p-3">
        <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>DESCEND {`-${formatNumber(limits.vzDownLimitMps, 1)} m/s`}</span>
          <span>NEUTRAL</span>
          <span>ASCEND {`+${formatNumber(limits.vzUpLimitMps, 1)} m/s`}</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="absolute inset-y-0 left-0 bg-slate-700" style={{ width: "50%" }} />
          <div className="absolute inset-y-0 right-0 bg-slate-700" style={{ width: "50%" }} />
          <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-slate-500" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="h-full w-full border-l border-dashed border-slate-600" />
          </div>
          <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-rose-500 via-emerald-500 to-cyan-500 opacity-20" />
          </div>
          <div
            className="absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_0_8px_rgba(34,211,238,0.12)]"
            style={{ left: `${flexRatio * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-[18px] border border-slate-800 bg-slate-950/90 p-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Flex offset
          </p>
          <p className="mt-2 text-lg font-semibold text-white tabular-nums">
            {formatSigned(snapshot.flexOffsetNorm, 2)}
          </p>
        </div>
        <div className="rounded-[18px] border border-slate-800 bg-slate-950/90 p-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Vz target
          </p>
          <p className="mt-2 text-lg font-semibold text-cyan-300 tabular-nums">
            {formatSigned(snapshot.vzTargetMps, 2)} m/s
          </p>
        </div>
        <div className="rounded-[18px] border border-slate-800 bg-slate-950/90 p-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            S_F
          </p>
          <p className="mt-2 text-lg font-semibold text-violet-300 tabular-nums">
            {formatNumber(snapshot.sF, 2)}
          </p>
        </div>
      </div>
    </div>
  );
}
