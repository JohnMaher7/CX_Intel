export function DimensionBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const pct = Math.max(0, Math.min(100, value * 20));
  return (
    <div className="atlas-dim">
      <div className="atlas-dim-row">
        <span>{label}</span>
        <span className="v tnum">{value.toFixed(1)}</span>
      </div>
      <div className="atlas-dim-track">
        <div className="atlas-dim-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
