import type { DroneUiSnapshot } from "../../types/droneUi";
import type { DroneUiLimits } from "../../config/uiLimits";
import { FlexZPanel } from "./FlexZPanel";
import { RpBaselinePanel } from "./RpBaselinePanel";
import { RpDiagnosticsPanel } from "./RpDiagnosticsPanel";
import { SafetyOverlay } from "./SafetyOverlay";
import { StatusHeader } from "./StatusHeader";
import { TelemetryStrip } from "./TelemetryStrip";
import { VideoPanel } from "./VideoPanel";

export interface DroneDashboardProps {
  snapshot: DroneUiSnapshot;
  limits: DroneUiLimits;
  videoStream?: MediaStream | null;
}

export function DroneDashboard({ snapshot, limits, videoStream }: DroneDashboardProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-3 py-4 text-slate-100">
      <div className="mx-auto w-full max-w-[390px]">
        <div className="space-y-3">
          <SafetyOverlay snapshot={snapshot} />
          <StatusHeader snapshot={snapshot} />
          <TelemetryStrip snapshot={snapshot} />
          <VideoPanel snapshot={snapshot} videoStream={videoStream} />
          <RpBaselinePanel snapshot={snapshot} limits={limits} />
          <FlexZPanel snapshot={snapshot} limits={limits} />
          <RpDiagnosticsPanel snapshot={snapshot} />
        </div>
      </div>
    </main>
  );
}
