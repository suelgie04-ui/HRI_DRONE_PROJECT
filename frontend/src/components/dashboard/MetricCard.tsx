interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  accent?: string;
}

export function MetricCard({ label, value, detail, accent = "text-white" }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className={`mt-2 text-base font-semibold tabular-nums ${accent}`}>{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
    </div>
  );
}
