import { Quote } from "lucide-react";
import { AtlasPill } from "@/components/atlas-pill";
import { AIChip } from "@/components/ai-chip";
import { type Bottleneck } from "@/lib/types";

export function BottleneckList({ bottlenecks }: { bottlenecks: Bottleneck[] }) {
  if (bottlenecks.length === 0) {
    return (
      <p className="text-[13px]" style={{ color: "var(--muted)" }}>
        No bottlenecks were extracted from this session.
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {bottlenecks.map((b, i) => (
        <li
          key={b.id}
          className={i > 0 ? "pt-3" : ""}
          style={
            i > 0 ? { borderTop: "1px solid var(--rule-soft)" } : undefined
          }
        >
          <div className="flex items-center gap-2">
            <AtlasPill>{b.stage}</AtlasPill>
            {b.ai_solvable && <AIChip />}
          </div>
          <div
            className="mt-[7px] text-[14.5px] font-medium leading-snug"
            style={{ color: "var(--ink)", lineHeight: 1.35 }}
          >
            {b.description}
          </div>
          <p
            className="mt-1.5 text-[13px] leading-relaxed"
            style={{ color: "var(--muted)", lineHeight: 1.5 }}
          >
            {b.ai_solvable_reasoning}
          </p>
          <figure
            className="mt-2.5 m-0 flex items-start gap-2.5 rounded-[8px] px-3 py-2.5"
            style={{ background: "var(--panel-2)" }}
          >
            <Quote
              className="h-3.5 w-3.5 flex-shrink-0 mt-0.5"
              style={{ color: "var(--accent)" }}
            />
            <blockquote
              className="m-0 text-[13px] italic leading-relaxed"
              style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}
            >
              &ldquo;{b.evidence_quote}&rdquo;
            </blockquote>
          </figure>
        </li>
      ))}
    </ul>
  );
}
