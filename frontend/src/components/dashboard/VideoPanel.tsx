import { useEffect, useRef, useState } from "react";
import type { DroneUiSnapshot } from "../../types/droneUi";

interface VideoPanelProps {
  snapshot: DroneUiSnapshot;
  videoStream?: MediaStream | null;
}

type WebRtcStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed";

async function waitForIceGatheringComplete(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === "complete") return;

  await new Promise<void>((resolve) => {
    const checkState = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", checkState);
        resolve();
      }
    };

    pc.addEventListener("icegatheringstatechange", checkState);

    // 너무 오래 멈추지 않도록 2초 뒤에는 진행
    window.setTimeout(() => {
      pc.removeEventListener("icegatheringstatechange", checkState);
      resolve();
    }, 2000);
  });
}

export function VideoPanel({ snapshot, videoStream }: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(
    videoStream ?? null
  );
  const [status, setStatus] = useState<WebRtcStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    if (videoStream) {
      setRemoteStream(videoStream);
    }
  }, [videoStream]);

  useEffect(() => {
    let cancelled = false;

    async function startWebRtc() {
      try {
        setStatus("connecting");
        setErrorMessage(null);

        const startedAt = performance.now();

        const pc = new RTCPeerConnection({
          iceServers: [],
        });

        pcRef.current = pc;

        pc.addTransceiver("video", { direction: "recvonly" });

        pc.ontrack = (event) => {
          if (cancelled) return;

          const [stream] = event.streams;

          if (stream) {
            setRemoteStream(stream);
          } else {
            const newStream = new MediaStream([event.track]);
            setRemoteStream(newStream);
          }

          setStatus("connected");
          setLatencyMs(Math.round(performance.now() - startedAt));
        };

        pc.onconnectionstatechange = () => {
          if (cancelled) return;

          if (pc.connectionState === "connected") {
            setStatus("connected");
          } else if (
            pc.connectionState === "failed" ||
            pc.connectionState === "closed"
          ) {
            setStatus("failed");
          } else if (pc.connectionState === "disconnected") {
            setStatus("disconnected");
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await waitForIceGatheringComplete(pc);

        const localDescription = pc.localDescription;

        if (!localDescription) {
          throw new Error("Failed to create local WebRTC offer.");
        }

        const response = await fetch("/api/offer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sdp: localDescription.sdp,
            type: localDescription.type,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`/api/offer failed: ${response.status} ${text}`);
        }

        const answer = await response.json();

        await pc.setRemoteDescription(
          new RTCSessionDescription({
            sdp: answer.sdp,
            type: answer.type,
          })
        );
      } catch (error) {
        if (cancelled) return;

        console.error("WebRTC auto connection failed:", error);
        setStatus("failed");
        setErrorMessage(
          error instanceof Error ? error.message : "Unknown WebRTC error"
        );
      }
    }

    startWebRtc();

    return () => {
      cancelled = true;

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      setRemoteStream(null);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (remoteStream) {
      video.srcObject = remoteStream;
      void video.play().catch(() => undefined);
    } else {
      video.srcObject = null;
    }

    return () => {
      video.srcObject = null;
    };
  }, [remoteStream]);

  const isConnected = Boolean(remoteStream) && status === "connected";
  const displayLatency = latencyMs ?? snapshot.videoLatencyMs;

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950/90 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Video Feed
          </p>
          <p className="text-sm font-medium text-slate-300">
            {isConnected
              ? "Live YOLO WebRTC stream connected"
              : status === "connecting"
                ? "Connecting to YOLO WebRTC stream..."
                : "Video disconnected"}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            isConnected
              ? "bg-emerald-500/15 text-emerald-300"
              : status === "connecting"
                ? "bg-cyan-500/15 text-cyan-300"
                : "bg-rose-500/15 text-rose-300"
          }`}
        >
          {isConnected
            ? `${displayLatency} ms`
            : status === "connecting"
              ? "CONNECTING"
              : "OFFLINE"}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 aspect-video">
        {remoteStream ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-slate-300">
            <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-cyan-300">
              {status === "connecting" ? "Connecting" : "No feed"}
            </div>

            <p className="text-sm leading-6">
              {status === "connecting"
                ? "Connecting to YOLO WebRTC backend automatically."
                : "Video stream is currently unavailable."}
            </p>

            {errorMessage ? (
              <p className="max-w-xl text-xs leading-5 text-rose-300">
                {errorMessage}
              </p>
            ) : null}
          </div>
        )}

        {!remoteStream && status !== "connecting" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-sm uppercase tracking-[0.3em] text-rose-200">
            VIDEO DISCONNECTED
          </div>
        ) : null}
      </div>
    </section>
  );
}
