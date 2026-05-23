"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { type Score } from "@/lib/types";
import { RUBRIC_V1, type DimensionName } from "@/lib/scoring/rubric";

const DIMENSION_ORDER: DimensionName[] = ["impact", "feasibility", "cost"];

const DIMENSION_LABEL: Record<DimensionName, string> = {
  impact: "Impact",
  feasibility: "Feasibility",
  cost: "Cost",
};

export function CompositeTile({ score }: { score: Score }) {
  return (
    <div
      className="min-w-[280px] rounded-[14px] border bg-card px-[22px] py-4"
      style={{ borderColor: "var(--rule)" }}
    >
      <div className="text-[12px]" style={{ color: "var(--muted)" }}>
        Composite · rubric {score.rubric_version}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          className="text-[56px] font-semibold leading-none"
          style={{
            color: "var(--accent)",
            letterSpacing: "-0.02em",
          }}
        >
          {score.composite.toFixed(1)}
        </span>
        <span className="text-[14px]" style={{ color: "var(--muted)" }}>
          / 5.0
        </span>
      </div>
      <div className="mt-3.5 flex gap-3">
        {DIMENSION_ORDER.map((d) => (
          <div key={d} className="flex-1">
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              {DIMENSION_LABEL[d]}
            </div>
            <div
              className="mt-px text-[18px] font-semibold"
              style={{ color: "var(--ink)" }}
            >
              {score.dimensions[d].dimension_score.toFixed(1)}
            </div>
            <div
              className="mt-1 h-[3px] overflow-hidden rounded-[2px]"
              style={{ background: "var(--rule-soft)" }}
            >
              <div
                className="h-full"
                style={{
                  background: "var(--accent)",
                  width: `${score.dimensions[d].dimension_score * 20}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DimensionsCard({ score }: { score: Score }) {
  return (
    <div
      className="rounded-[12px] border bg-card p-5"
      style={{ borderColor: "var(--rule)" }}
    >
      <div
        className="mb-3.5 text-[11.5px] font-medium uppercase tracking-[0.06em]"
        style={{ color: "var(--muted)" }}
      >
        Dimensions
      </div>
      <div className="flex flex-col gap-3.5">
        {DIMENSION_ORDER.map((d) => {
          const meta = RUBRIC_V1.dimensions[d];
          const dim = score.dimensions[d];
          return (
            <div key={d}>
              <div className="mb-2 flex items-baseline justify-between">
                <div>
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: "var(--ink)" }}
                  >
                    {DIMENSION_LABEL[d]}
                  </span>
                  <span
                    className="ml-2 text-[11.5px]"
                    style={{ color: "var(--muted)" }}
                  >
                    weight {meta.weight}
                  </span>
                </div>
                <span
                  className="text-[18px] font-semibold"
                  style={{ color: "var(--accent)" }}
                >
                  {dim.dimension_score.toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {dim.sub_scores.map((sb) => (
                  <div
                    key={sb.name}
                    className="rounded-[8px] px-2.5 py-2"
                    style={{ background: "var(--panel-2)" }}
                  >
                    <div
                      className="text-[11px] uppercase tracking-[0.04em]"
                      style={{ color: "var(--muted)" }}
                    >
                      {sb.name.replace(/_/g, " ")}
                    </div>
                    <div className="mt-0.5">
                      <span
                        className="text-[14px] font-semibold"
                        style={{ color: "var(--ink)" }}
                      >
                        {sb.score}
                      </span>
                      <span
                        className="ml-1 text-[11px]"
                        style={{ color: "var(--muted)" }}
                      >
                        / 5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SubScoresAside({ score }: { score: Score }) {
  const [focus, setFocus] = React.useState<DimensionName>("impact");
  const [open, setOpen] = React.useState(false);

  const dim = score.dimensions[focus];

  return (
    <aside
      className="rounded-[12px] border bg-card p-5"
      style={{ borderColor: "var(--rule)" }}
    >
      <div className="relative mb-3.5 flex items-center gap-2.5">
        <h2
          className="text-[14px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          Sub-scores · {DIMENSION_LABEL[focus]}
        </h2>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 text-[12.5px]"
          style={{ color: "var(--ink-soft)" }}
        >
          {DIMENSION_LABEL[focus]} <ChevronDown className="h-3 w-3" />
        </button>
        {open && (
          <div
            className="absolute right-0 top-9 z-10 min-w-[140px] overflow-hidden rounded-[8px] border bg-card shadow-lg"
            style={{ borderColor: "var(--rule)" }}
          >
            {DIMENSION_ORDER.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setFocus(d);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-[12.5px] hover:bg-[var(--panel-2)]"
                style={{
                  color: d === focus ? "var(--accent)" : "var(--ink)",
                  fontWeight: d === focus ? 500 : 400,
                }}
              >
                {DIMENSION_LABEL[d]}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {dim.sub_scores.map((sb) => (
          <div
            key={sb.name}
            className="rounded-[10px] px-3.5 py-3"
            style={{ background: "var(--panel-2)" }}
          >
            <div className="flex items-baseline justify-between">
              <span
                className="text-[13px] font-medium capitalize"
                style={{ color: "var(--ink)" }}
              >
                {sb.name.replace(/_/g, " ")}
              </span>
              <span
                className="text-[14px] font-semibold"
                style={{ color: "var(--accent)" }}
              >
                {sb.score} / 5
              </span>
            </div>
            <p
              className="mt-1.5 text-[12.5px] leading-relaxed"
              style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}
            >
              {sb.rationale}
            </p>
            <blockquote
              className="m-0 mt-2.5 rounded-[6px] border-l-2 px-3 py-2 text-[12px] italic"
              style={{
                background: "var(--panel)",
                color: "var(--muted)",
                borderColor: "var(--accent)",
              }}
            >
              &ldquo;{sb.evidence_quote}&rdquo;
            </blockquote>
          </div>
        ))}
      </div>
    </aside>
  );
}
