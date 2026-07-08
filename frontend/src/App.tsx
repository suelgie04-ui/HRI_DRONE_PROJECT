import { useState, useEffect, useRef } from "react";
import { DroneDashboard } from "./components/dashboard/DroneDashboard";
import { DEFAULT_UI_LIMITS } from "./config/uiLimits";
import type { DroneUiSnapshot, OperatingState, RpInitializationState, BaselineStatus } from "./types/droneUi";
import {
  mockSnapshot,
  initializingSnapshot,
  initFailedSnapshot,
  hardFailSnapshot,
  staleSnapshot,
} from "./mocks/mockDroneUiSnapshot";

function App() {
  const [snapshot, setSnapshot] = useState<DroneUiSnapshot>(mockSnapshot);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const signalingUrl = import.meta.env.DEV
    ? "/api/offer"
    : import.meta.env.VITE_WEBRTC_BASE_URL ??
      `http://${window.location.hostname}:8080/offer`;

  const updateSnapshot = (updates: Partial<DroneUiSnapshot>) => {
    setSnapshot((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    return () => {
      pcRef.current?.close();
      pcRef.current = null;
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null;
      }
    };
  }, []);

  const setActiveStream = (stream: MediaStream | null) => {
    if (videoStreamRef.current && videoStreamRef.current !== stream) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    videoStreamRef.current = stream;
    setVideoStream(stream);
  };

  const stopYoloStream = () => {
    pcRef.current?.close();
    pcRef.current = null;
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    setVideoStream(null);
    updateSnapshot({ videoConnected: false });
  };

  const connectToYoloStream = async () => {
    if (pcRef.current || isConnecting) return;

    setIsConnecting(true);

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.addTransceiver("video", { direction: "recvonly" });

      pc.ontrack = (event) => {
        const stream = event.streams?.[0] ?? null;
        if (stream) {
          setActiveStream(stream);
          updateSnapshot({ videoConnected: true, videoLatencyMs: 0 });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(signalingUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pc.localDescription),
      });

      if (!response.ok) {
        throw new Error(`Offer exchange failed with status ${response.status}`);
      }

      const answer = await response.json();
      await pc.setRemoteDescription(answer);
      updateSnapshot({ videoConnected: true, videoLatencyMs: 0 });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to connect to YOLO WebRTC stream", error);
      stopYoloStream();
    } finally {
      setIsConnecting(false);
    }
  };

  const operatingStates: OperatingState[] = [
    "LINK_WAIT",
    "DISARMED_NOT_READY",
    "INITIALIZING",
    "READY_FOR_FLIGHT",
    "ARMED_IDLE",
    "ENGAGED_ENTRY",
    "ENGAGED_STEADY",
    "HARD_FAIL",
  ];

  const rpInitStates: RpInitializationState[] = [
    "NOT_STARTED",
    "INITIALIZING",
    "SUCCEEDED",
    "FAILED",
  ];

  const baselineStatuses: BaselineStatus[] = [
    "INVALID",
    "LOCKED",
    "UPDATE_ALLOWED",
    "HOLDING",
    "UPDATING",
  ];

  const quickSnapshots = [
    { label: "ENGAGED STEADY", value: mockSnapshot },
    { label: "INITIALIZING", value: initializingSnapshot },
    { label: "INIT FAILED", value: initFailedSnapshot },
    { label: "HARD FAIL", value: hardFailSnapshot },
    { label: "STALE", value: staleSnapshot },
  ];

  return (
    <div className="flex min-h-screen gap-4 bg-slate-900 p-4">
      {/* Main Dashboard */}
      <div className="flex-1">
        <DroneDashboard
          snapshot={snapshot}
          limits={DEFAULT_UI_LIMITS}
          videoStream={videoStream}
        />
      </div>

      {/* Control Panel */}
      <div className="w-80 space-y-4 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 p-4">
        <h2 className="text-lg font-bold text-white">Control Panel</h2>

        {/* Quick Snapshots */}
        <div className="space-y-2 border-b border-slate-700 pb-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Quick Snapshots</p>
          <div className="grid gap-2">
            {quickSnapshots.map((item) => (
              <button
                key={item.label}
                onClick={() => setSnapshot(item.value)}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Core Parameters */}
        <div className="space-y-3 border-b border-slate-700 pb-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Core</p>

          <div>
            <label className="text-[10px] text-slate-400">Operating State</label>
            <select
              value={snapshot.operatingState}
              onChange={(e) => updateSnapshot({ operatingState: e.target.value as OperatingState })}
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1 text-xs text-white"
            >
              {operatingStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400">Permission</label>
            <select
              value={snapshot.forwardingPermission}
              onChange={(e) => updateSnapshot({ forwardingPermission: e.target.value as "ENGAGED" | "DISENGAGED" })}
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1 text-xs text-white"
            >
              <option value="ENGAGED">ENGAGED</option>
              <option value="DISENGAGED">DISENGAGED</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              Battery: {snapshot.batteryPercent}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={snapshot.batteryPercent}
              onChange={(e) => updateSnapshot({ batteryPercent: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              Altitude: {snapshot.altitudeM.toFixed(1)} m
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={snapshot.altitudeM}
              onChange={(e) => updateSnapshot({ altitudeM: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              Vz Actual: {snapshot.vzActualMps.toFixed(2)} m/s
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.01"
              value={snapshot.vzActualMps}
              onChange={(e) => updateSnapshot({ vzActualMps: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>
        </div>

        {/* RP Parameters */}
        <div className="space-y-3 border-b border-slate-700 pb-4">
          <p className="text-xs font-semibold uppercase text-slate-400">RP Baseline</p>

          <div>
            <label className="text-[10px] text-slate-400">
              Theta Swing: {snapshot.thetaSwingRelRad.toFixed(3)} rad
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={snapshot.thetaSwingRelRad}
              onChange={(e) => updateSnapshot({ thetaSwingRelRad: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              Lateral: {snapshot.swingLateralRad.toFixed(2)} rad
            </label>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.01"
              value={snapshot.swingLateralRad}
              onChange={(e) => updateSnapshot({ swingLateralRad: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              Vertical: {snapshot.swingVerticalRad.toFixed(2)} rad
            </label>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.01"
              value={snapshot.swingVerticalRad}
              onChange={(e) => updateSnapshot({ swingVerticalRad: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">Baseline Status</label>
            <select
              value={snapshot.baselineStatus}
              onChange={(e) => updateSnapshot({ baselineStatus: e.target.value as BaselineStatus })}
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1 text-xs text-white"
            >
              {baselineStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flex / Z Parameters */}
        <div className="space-y-3 border-b border-slate-700 pb-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Flex / Z</p>

          <div>
            <label className="text-[10px] text-slate-400">
              Flex Offset: {snapshot.flexOffsetNorm.toFixed(2)}
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={snapshot.flexOffsetNorm}
              onChange={(e) => updateSnapshot({ flexOffsetNorm: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              Vz Target: {snapshot.vzTargetMps.toFixed(2)} m/s
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={snapshot.vzTargetMps}
              onChange={(e) => updateSnapshot({ vzTargetMps: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              S_F: {snapshot.sF.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={snapshot.sF}
              onChange={(e) => updateSnapshot({ sF: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>
        </div>

        {/* Gate Parameters */}
        <div className="space-y-3 border-b border-slate-700 pb-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Gates</p>

          <div>
            <label className="text-[10px] text-slate-400">
              P Value: {snapshot.pValue.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={snapshot.pValue}
              onChange={(e) => updateSnapshot({ pValue: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              S Gate: {snapshot.sGate.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={snapshot.sGate}
              onChange={(e) => updateSnapshot({ sGate: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>
        </div>

        {/* Rate Parameters */}
        <div className="space-y-3 border-b border-slate-700 pb-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Rates</p>

          <div>
            <label className="text-[10px] text-slate-400">
              Roll Rate: {snapshot.actualRollRateRadS.toFixed(2)} rad/s
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={snapshot.actualRollRateRadS}
              onChange={(e) => updateSnapshot({ actualRollRateRadS: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              Pitch Rate: {snapshot.actualPitchRateRadS.toFixed(2)} rad/s
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={snapshot.actualPitchRateRadS}
              onChange={(e) => updateSnapshot({ actualPitchRateRadS: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>
        </div>

        {/* RP Init Parameters */}
        <div className="space-y-3 border-b border-slate-700 pb-4">
          <p className="text-xs font-semibold uppercase text-slate-400">RP Init</p>

          <div>
            <label className="text-[10px] text-slate-400">RP Init State</label>
            <select
              value={snapshot.rpInitState}
              onChange={(e) => updateSnapshot({ rpInitState: e.target.value as RpInitializationState })}
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1 text-xs text-white"
            >
              {rpInitStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              RP Init Progress: {Math.round(snapshot.rpInitProgress * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={snapshot.rpInitProgress}
              onChange={(e) => updateSnapshot({ rpInitProgress: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>
        </div>

        {/* Entry Parameters */}
        <div className="space-y-3 border-b border-slate-700 pb-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Entry</p>

          <div>
            <label className="text-[10px] text-slate-400">
              Entry Progress: {Math.round(snapshot.entryProgress * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={snapshot.entryProgress}
              onChange={(e) => updateSnapshot({ entryProgress: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">
              Video Latency: {snapshot.videoLatencyMs} ms
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="1"
              value={snapshot.videoLatencyMs}
              onChange={(e) => updateSnapshot({ videoLatencyMs: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>
          <div className="mt-3 space-y-2 border-t border-slate-700 pt-3">
            <p className="text-[10px] text-slate-400">YOLO WebRTC</p>
            <div className="grid gap-2">
              <div className="flex gap-2">
                <button
                  onClick={connectToYoloStream}
                  disabled={isConnecting}
                  className="w-1/2 rounded bg-slate-800 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConnecting ? "Connecting…" : "Connect YOLO Stream"}
                </button>
                <button
                  onClick={stopYoloStream}
                  className="w-1/2 rounded bg-slate-800 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700"
                >
                  Stop Stream
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Connects to the YOLO WebRTC server at {signalingUrl}.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Flags */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-slate-400">Safety</p>
          <div className="space-y-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={snapshot.hardgateEvent}
                onChange={(e) => updateSnapshot({ hardgateEvent: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-xs text-slate-300">Hardgate Event</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={snapshot.persistentEscalation}
                onChange={(e) => updateSnapshot({ persistentEscalation: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-xs text-slate-300">Persistent Escalation</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={snapshot.immediateHardFail}
                onChange={(e) => updateSnapshot({ immediateHardFail: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-xs text-slate-300">Immediate Hard Fail</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={snapshot.videoConnected}
                onChange={(e) => updateSnapshot({ videoConnected: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-xs text-slate-300">Video Connected</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={snapshot.telemetryFresh}
                onChange={(e) => updateSnapshot({ telemetryFresh: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-xs text-slate-300">Telemetry Fresh</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
