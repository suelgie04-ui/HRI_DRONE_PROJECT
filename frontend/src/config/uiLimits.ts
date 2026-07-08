export interface DroneUiLimits {
  // RP scalar deviation
  rpNeutralBandRad: number;
  rpWarningRad: number;
  rpDeviationDisplayMaxRad: number;

  // RP 2D direction
  rpDirectionDisplayMaxRad: number;

  // Flex normalized bar
  flexNeutralBandNorm: number;
  flexDisplayMinNorm: number;
  flexDisplayMaxNorm: number;

  // Z velocity limit
  vzUpLimitMps: number;
  vzDownLimitMps: number;

  // UI warning threshold
  videoLatencyWarningMs: number;
  videoLatencyCriticalMs: number;
  batteryLowPercent: number;
  batteryCriticalPercent: number;
}

export const DEFAULT_UI_LIMITS: DroneUiLimits = {
  rpNeutralBandRad: 0.03,
  rpWarningRad: 0.30,
  rpDeviationDisplayMaxRad: 0.50,

  rpDirectionDisplayMaxRad: 0.50,

  flexNeutralBandNorm: 0.10,
  flexDisplayMinNorm: -1.0,
  flexDisplayMaxNorm: 1.0,

  vzUpLimitMps: 0.8,
  vzDownLimitMps: 0.4,

  videoLatencyWarningMs: 150,
  videoLatencyCriticalMs: 300,

  batteryLowPercent: 30,
  batteryCriticalPercent: 15,
};
