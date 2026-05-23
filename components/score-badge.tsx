import { cn } from "@/lib/utils";

export function ScoreBadge({
  composite,
  big,
  className,
}: {
  composite: number;
  big?: boolean;
  className?: string;
}) {
  const tier = composite >= 4 ? "hi" : composite >= 3 ? "mid" : "lo";
  return (
    <span
      className={cn("atlas-score", tier, className)}
      style={
        big
          ? { fontSize: 22, minWidth: 64, height: 40, padding: "0 14px" }
          : undefined
      }
    >
      {composite.toFixed(1)}
    </span>
  );
}
