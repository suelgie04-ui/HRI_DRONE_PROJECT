import type { DroneUiSnapshot } from "../../types/droneUi";

interface SafetyOverlayProps {
  snapshot: DroneUiSnapshot;
}

export function SafetyOverlay({ snapshot }: SafetyOverlayProps) {
  const banners = [] as Array<{ label: string; tone: string }>;

  if (snapshot.immediateHardFail) {
    return (
      <div className="rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-rose-200 shadow-sm">
        <div>HARD FAIL</div>
        <div className="mt-1 text-xs text-slate-300">OUTPUT BLOCKED</div>
      </div>
    );
  }

  if (snapshot.persistentEscalation) {
    banners.push({
      label: "SAFETY ESCALATION",
      tone: "bg-amber-500/10 text-amber-200 border-amber-500/20",
    });
  }
  if (snapshot.hardgateEvent) {
    banners.push({
      label: "HARDGATE EVENT",
      tone: "bg-slate-800/10 text-slate-100 border-slate-700/40",
    });
  }

  if (!banners.length) return null;

  return (
    <div className="space-y-2">
      {banners.map((banner) => (
        <div
          key={banner.label}
          className={`rounded-[20px] border px-3 py-2 text-center text-sm font-semibold uppercase tracking-[0.22em] ${banner.tone}`}
        >
          {banner.label}
        </div>
      ))}
    </div>
  );
}
