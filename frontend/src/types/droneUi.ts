export type OperatingState =
  | "LINK_WAIT"
  | "DISARMED_NOT_READY"
  | "INITIALIZING"
  | "READY_FOR_FLIGHT"
  | "ARMED_IDLE"
  | "ENGAGED_ENTRY"
  | "ENGAGED_STEADY"
  | "HARD_FAIL";

export type RpInitializationState =
  | "NOT_STARTED"
  | "INITIALIZING"
  | "SUCCEEDED"
  | "FAILED";

export type RpInitializationFailureReason =
  | "NONE"
  | "INSUFFICIENT_DATA"
  | "HIGH_STD"
  | "INVALID_DATA"
  | "TIMEOUT";

export type BaselineStatus =
  | "INVALID"
  | "LOCKED"
  | "UPDATE_ALLOWED"
  | "HOLDING"
  | "UPDATING";

export interface DroneUiSnapshot {
  // Snapshot 상태
  timestampMs: number;
  telemetryFresh: boolean;

  // 상위 상태
  forwardingPermission: "ENGAGED" | "DISENGAGED";
  operatingState: OperatingState;

  // 통신 / 영상
  videoConnected: boolean;
  videoLatencyMs: number;

  // 기본 기체 정보
  batteryPercent: number;
  altitudeM: number;
  vzActualMps: number;

  // Gate / authority shaping
  pValue: number; // 0~1
  sGate: number; // 0~1
  sF: number; // 0~1

  // Safety event
  hardgateEvent: boolean;
  persistentEscalation: boolean;
  immediateHardFail: boolean;

  // RP baseline
  thetaSwingRelRad: number; // 0 이상 scalar deviation
  swingLateralRad: number; // RP 2D plot X
  swingVerticalRad: number; // RP 2D plot Y
  baselineStatus: BaselineStatus;

  // Flex / Z intent
  flexOffsetNorm: number; // -1~+1, 무단위
  vzTargetMps: number;

  // RP initialization
  rpInitState: RpInitializationState;
  rpInitProgress: number; // 0~1
  rpInitFailureReason: RpInitializationFailureReason;

  // ENGAGED_ENTRY 진행률
  entryProgress: number; // 0~1

  // PX4 actual rate
  actualRollRateRadS: number;
  actualPitchRateRadS: number;
}
