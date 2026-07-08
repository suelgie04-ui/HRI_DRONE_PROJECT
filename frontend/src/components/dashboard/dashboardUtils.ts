export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function formatNumber(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "--";
  return value.toFixed(digits);
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "--";
  return `${Math.round(value * 100)}%`;
}

export function formatSigned(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "--";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}
