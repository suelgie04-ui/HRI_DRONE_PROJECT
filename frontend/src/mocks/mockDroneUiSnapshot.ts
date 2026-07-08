import type { DroneUiSnapshot } from "../types/droneUi";

export const mockSnapshot: DroneUiSnapshot = {
  timestampMs: Date.now(),
  telemetryFresh: true,

  forwardingPermission: "ENGAGED",
  operatingState: "ENGAGED_STEADY",

  videoConnected: true,
  videoLatencyMs: 42,

  batteryPercent: 76,
  altitudeM: 2.1,
  vzActualMps: 0.12,

  pValue: 0.43,
  sGate: 0.91,
  sF: 0.08,

  hardgateEvent: false,
  persistentEscalation: false,
  immediateHardFail: false,

  thetaSwingRelRad: 0.022,
  swingLateralRad: 0.18,
  swingVerticalRad: -0.12,
  baselineStatus: "LOCKED",

  flexOffsetNorm: 0.06,
  vzTargetMps: 0.12,

  rpInitState: "SUCCEEDED",
  rpInitProgress: 1.0,
  rpInitFailureReason: "NONE",

  entryProgress: 1.0,

  actualRollRateRadS: 0.07,
  actualPitchRateRadS: -0.03,
};

export const initializingSnapshot: DroneUiSnapshot = {
  ...mockSnapshot,
  operatingState: "INITIALIZING",
  rpInitState: "INITIALIZING",
  rpInitProgress: 0.64,
  entryProgress: 0.64,
};

export const initFailedSnapshot: DroneUiSnapshot = {
  ...mockSnapshot,
  rpInitState: "FAILED",
  rpInitFailureReason: "HIGH_STD",
  rpInitProgress: 0.42,
};

export const hardFailSnapshot: DroneUiSnapshot = {
  ...mockSnapshot,
  forwardingPermission: "DISENGAGED",
  operatingState: "HARD_FAIL",
  immediateHardFail: true,
};

export const staleSnapshot: DroneUiSnapshot = {
  ...mockSnapshot,
  telemetryFresh: false,
  videoConnected: false,
};
