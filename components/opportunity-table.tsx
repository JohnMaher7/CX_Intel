"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, Info } from "lucide-react";
import { ScoreBadge } from "@/components/score-badge";
import { DimensionBar } from "@/components/dimension-bar";
import { AIChip } from "@/components/ai-chip";
import { AtlasPill } from "@/components/atlas-pill";
import { type Opportunity, type Score } from "@/lib/types";

export type RankedOpportunity = Opportunity & {
  score: Score;
  stage?: string;
  ai_solvable?: boolean;
};

type FilterKey = "all" | "ai" | "hi" | "recent";

export function OpportunityBoard({
  opportunities,
  sessionTitle,
}: {
  opportunities: RankedOpportunity[];
  sessionTitle: Record<string, string>;
}) {
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const filters = React.useMemo(() => {
    const aiCount = opportunities.filter((o) => o.ai_solvable !== false).length;
    const hiCount = opportunities.filter((o) => o.score.composite >= 4).length;
    return [
      { k: "all" as const, label: "All", count: opportunities.length },
      { k: "ai" as const, label: "AI-solvable", count: aiCount },
      { k: "hi" as const, label: "High score", count: hiCount },
      { k: "recent" as const, label: "Recent", count: Math.min(opportunities.length, 5) },
    ];
  }, [opportunities]);

  const filtered = React.useMemo(() => {
    switch (filter) {
      case "ai":
        return opportunities.filter((o) => o.ai_solvable !== false);
      case "hi":
        return opportunities.filter((o) => o.score.composite >= 4);
      case "recent":
        return [...opportunities]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 5);
      default:
        return opportunities;
    }
  }, [opportunities, filter]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedIdsList = Array.from(selectedIds);
  const canCompare = selectedIdsList.length >= 2;
  const compareHref = `/compare?ids=${selectedIdsList.slice(0, 3).join(",")}`;

  return (
    <>
      <div className="flex items-center gap-2 px-7 pb-3 pt-1">
        <div
          className="flex gap-1 rounded-full border p-1"
          style={{
            background: "var(--panel-2)",
            borderColor: "var(--rule)",
          }}
        >
          {filters.map((ff) => {
            const on = filter === ff.k;
            return (
              <button
                key={ff.k}
                onClick={() => setFilter(ff.k)}
                className="inline-flex items-center gap-1.5 rounded-full border-0 px-3 py-1 text-[12.5px] transition-colors"
                style={{
                  background: on ? "var(--panel)" : "transparent",
                  color: on ? "var(--ink)" : "var(--muted)",
                  fontWeight: on ? 500 : 400,
                  boxShadow: on
                    ? "0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px var(--rule)"
                    : "none",
                }}
              >
                {ff.label}
                <span
                  className="text-[11px]"
                  style={{ color: on ? "var(--muted)" : "var(--muted-2)" }}
                >
                  {ff.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <button
          className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12.5px]"
          style={{ color: "var(--ink-soft)" }}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More filters
        </button>
        <span
          className="h-[18px] w-px"
          style={{ background: "var(--rule)" }}
          aria-hidden
        />
        <button
          className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12.5px]"
          style={{ color: "var(--ink-soft)" }}
          disabled
          title="Select 2 rows to compare"
        >
          Compare 2 <Info className="h-3 w-3" />
        </button>
      </div>

      <div
        className="mx-7 overflow-hidden rounded-[12px] border bg-card"
        style={{ borderColor: "var(--rule)" }}
      >
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr
              style={{
                background: "var(--panel-2)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <Th w={34} />
              <Th w={40}>#</Th>
              <Th w={76}>Score</Th>
              <Th>Problem</Th>
              <Th w={80}>Impact</Th>
              <Th w={90}>Feasibility</Th>
              <Th w={80}>Cost</Th>
              <Th w={160}>Source</Th>
              <Th w={32} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr
                key={o.id}
                className="transition-colors hover:bg-[var(--panel-2)]"
                style={{ borderBottom: "1px solid var(--rule-soft)" }}
              >
                <Td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(o.id)}
                    onChange={() => toggle(o.id)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                </Td>
                <Td>
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: "var(--muted)" }}
                  >
                    {i + 1}
                  </span>
                </Td>
                <Td>
                  <ScoreBadge composite={o.score.composite} />
                </Td>
                <Td>
                  <Link
                    href={`/opportunities/${o.id}`}
                    className="flex items-center gap-2 no-underline hover:underline"
                  >
                    <span
                      className="text-[13.5px] font-medium"
                      style={{ color: "var(--ink)" }}
                    >
                      {o.problem_statement}
                    </span>
                    {o.ai_solvable !== false && <AIChip />}
                  </Link>
                  {o.stage && (
                    <div className="mt-1.5 flex gap-1.5">
                      <AtlasPill>{o.stage}</AtlasPill>
                    </div>
                  )}
                </Td>
                <Td>
                  <DimensionBar
                    label="I"
                    value={o.score.dimensions.impact.dimension_score}
                  />
                </Td>
                <Td>
                  <DimensionBar
                    label="F"
                    value={o.score.dimensions.feasibility.dimension_score}
                  />
                </Td>
                <Td>
                  <DimensionBar
                    label="C"
                    value={o.score.dimensions.cost.dimension_score}
                  />
                </Td>
                <Td>
                  <Link
                    href={`/sessions/${o.session_id}`}
                    className="block truncate text-[12px] no-underline hover:underline"
                    style={{ color: "var(--muted)" }}
                  >
                    {sessionTitle[o.session_id] ?? o.session_id}
                  </Link>
                </Td>
                <Td>
                  <Link
                    href={`/opportunities/${o.id}`}
                    aria-label="Open opportunity"
                    style={{ color: "var(--muted-2)" }}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="flex items-center gap-4 px-7 pb-4 pt-3 text-[12px]"
        style={{ color: "var(--muted)" }}
      >
        <span>
          Showing {filtered.length} of {opportunities.length}
          {selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ""}
        </span>
        <div className="flex-1" />
        {canCompare ? (
          <Link
            href={compareHref}
            className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12.5px] no-underline"
            style={{ color: "var(--accent)" }}
          >
            Compare selected →
          </Link>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12.5px]"
            style={{ color: "var(--muted-2)" }}
          >
            Select 2 to compare
          </span>
        )}
      </div>
    </>
  );
}

function Th({ children, w }: { children?: React.ReactNode; w?: number }) {
  return (
    <th
      className="px-3.5 py-3 text-left text-[11.5px] font-medium"
      style={{ color: "var(--muted)", width: w }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children?: React.ReactNode }) {
  return (
    <td className="px-3.5 py-3.5 align-middle">
      {children}
    </td>
  );
}
