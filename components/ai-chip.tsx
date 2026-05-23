import { Sparkles } from "lucide-react";

export function AIChip({ label = "AI-solvable" }: { label?: string }) {
  return (
    <span className="atlas-ai-chip">
      <Sparkles className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}
