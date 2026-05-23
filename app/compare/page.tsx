import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb, Topbar } from "@/components/topbar";
import { AtlasPill } from "@/components/atlas-pill";
import { AIChip } from "@/components/ai-chip";
import { getOpportunity } from "@/lib/storage/opportunities";
import { getSession } from "@/lib/storage/sessions";
import type { Bottleneck, Opportunity, Score } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare opportunities",
};

type Loaded = {
  opp: Opportunity & { score: Score };
  sessionTitle: string;
  bottleneck: Bottleneck | undefined;
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const ids = (idsParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const loaded = (
    await Promise.all(
      ids.map(async (id): Promise<Loaded | null> => {
        const opp = await getOpportunity(id);
        if (!opp || !opp.score) return null;
        const session = await getSession(opp.session_id);
        return {
          opp: opp as Opportunity & { score: Score },
          sessionTitle: session?.title ?? opp.session_id,
          bottleneck: session?.bottlenecks?.find(
            (b) => b.id === opp.bottleneck_id,
          ),
        };
      }),
    )
  ).filter((x): x is Loaded => x !== null);

  return (
    <>
      <Breadcrumb
        segments={[{ label: "Backlog", href: "/" }, { label: "Compare" }]}
      />
      <Topbar
        title="Compare opportunities"
        subtitle="Side-by-side view of selected backlog items, with score deltas highlighted. Use this when two candidates feel similar in priority and you need a tiebreaker."
        right={
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12.5px] no-underline"
            style={{ color: "var(--ink-soft)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to backlog
          </Link>
        }
      />

      {loaded.length === 0 ? (
        <EmptyState />
      ) : loaded.length === 1 ? (
        <SinglePrompt loaded={loaded[0]} />
      ) : (
        <div
          className={`grid flex-1 grid-cols-1 gap-5 px-7 pb-6 pt-5 ${loaded.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}
        >
          {loaded.map((l, i) => (
            <CompareCard
              key={l.opp.id}
              loaded={l}
              index={i}
              others={loaded.filter((_, j) => j !== i)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function CompareCard({
  loaded,
  others,
}: {
  loaded: Loaded;
  index: number;
  others: Loaded[];
}) {
  const { opp, sessionTitle, bottleneck } = loaded;
  const score = opp.score;

  const otherComposite = avg(others.map((o) => o.opp.score.composite));
  const compositeDelta = score.composite - otherComposite;

  const dimDeltas = {
    impact:
      score.dimensions.impact.dimension_score -
      avg(others.map((o) => o.opp.score.dimensions.impact.dimension_score)),
    feasibility:
      score.dimensions.feasibility.dimension_score -
      avg(
        others.map(
          (o) => o.opp.score.dimensions.feasibility.dimension_score,
        ),
      ),
    cost:
      score.dimensions.cost.dimension_score -
      avg(others.map((o) => o.opp.score.dimensions.cost.dimension_score)),
  };

  return (
    <article
      className="flex flex-col rounded-[14px] border bg-card p-[22px]"
      style={{ borderColor: "var(--rule)" }}
    >
      <div className="mb-2 flex flex-wrap gap-2">
        <AtlasPill>{opp.id}</AtlasPill>
        {bottleneck?.stage && <AtlasPill>{bottleneck.stage}</AtlasPill>}
        {(bottleneck?.ai_solvable ?? true) && <AIChip />}
      </div>
      <h2
        className="font-editorial text-[22px] font-normal leading-snug"
        style={{ color: "var(--ink)", letterSpacing: "-0.005em" }}
      >
        {opp.problem_statement}
      </h2>
      <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--muted)" }}>
        {sessionTitle}
      </p>

      <div className="mt-[18px] flex items-baseline gap-3">
        <span
          className="text-[56px] font-semibold leading-none"
          style={{ color: "var(--accent)", letterSpacing: "-0.02em" }}
        >
          {score.composite.toFixed(1)}
        </span>
        <div>
          <div className="text-[11px]" style={{ color: "var(--muted)" }}>
            Composite
          </div>
          <div
            className="mt-0.5 text-[12px] font-medium"
            style={{ color: deltaColor(compositeDelta) }}
          >
            {formatDelta(compositeDelta)} vs others
          </div>
        </div>
      </div>

      <div className="mt-[18px] flex flex-col gap-2.5">
        {(
          [
            ["Impact", score.dimensions.impact.dimension_score, dimDeltas.impact],
            [
              "Feasibility",
              score.dimensions.feasibility.dimension_score,
              dimDeltas.feasibility,
            ],
            ["Cost", score.dimensions.cost.dimension_score, dimDeltas.cost],
          ] as const
        ).map(([label, v, delta]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-[12.5px]">
              <span style={{ color: "var(--ink-soft)" }}>{label}</span>
              <span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {v.toFixed(1)}
                </span>
                <span
                  className="ml-2 text-[11.5px]"
                  style={{ color: deltaColor(delta) }}
                >
                  {formatDelta(delta)}
                </span>
              </span>
            </div>
            <div
              className="h-[6px] overflow-hidden rounded-[3px]"
              style={{ background: "var(--panel-2)" }}
            >
              <div
                className="h-full"
                style={{
                  background: "var(--accent)",
                  width: `${v * 20}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {bottleneck && (
        <div
          className="mt-[18px] border-t pt-3.5"
          style={{ borderColor: "var(--rule-soft)" }}
        >
          <div
            className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.06em]"
            style={{ color: "var(--muted)" }}
          >
            Strongest evidence
          </div>
          <blockquote
            className="m-0 rounded-[8px] border-l-2 px-3 py-2.5 text-[13.5px] italic leading-snug"
            style={{
              background: "var(--panel-2)",
              borderColor: "var(--accent)",
              color: "var(--ink)",
              lineHeight: 1.5,
            }}
          >
            &ldquo;{bottleneck.evidence_quote}&rdquo;
          </blockquote>
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-4">
        <Link
          href={`/opportunities/${opp.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border px-[13px] py-[7px] text-[13px] no-underline"
          style={{
            background: "var(--panel)",
            color: "var(--ink)",
            borderColor: "var(--rule)",
          }}
        >
          Open detail
        </Link>
        <button
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] px-[13px] py-[7px] text-[13px] font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          Add to roadmap
        </button>
      </div>
    </article>
  );
}

function SinglePrompt({ loaded }: { loaded: Loaded }) {
  return (
    <div className="px-7 pb-6 pt-5">
      <div
        className="rounded-[12px] border p-5"
        style={{
          background: "var(--accent-soft)",
          borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)",
        }}
      >
        <h3
          className="text-[15px] font-semibold"
          style={{ color: "var(--accent-ink)" }}
        >
          One opportunity loaded — pick another to compare.
        </h3>
        <p
          className="mt-1 text-[13px]"
          style={{ color: "var(--ink-soft)" }}
        >
          Open the backlog, select a second opportunity via the row checkbox,
          and click "Compare selected →".
        </p>
        <p className="mt-2 text-[12.5px]" style={{ color: "var(--muted)" }}>
          Currently loaded: <strong>{loaded.opp.problem_statement}</strong>{" "}
          (composite {loaded.opp.score.composite.toFixed(1)})
        </p>
        <Link
          href="/"
          className="mt-3 inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-[7px] text-[13px] font-medium text-white no-underline"
          style={{ background: "var(--accent)" }}
        >
          Back to backlog
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-7 pb-6 pt-5">
      <div
        className="rounded-[12px] border border-dashed p-6"
        style={{ borderColor: "var(--rule)" }}
      >
        <h3
          className="text-[15px] font-medium"
          style={{ color: "var(--ink)" }}
        >
          Nothing to compare yet.
        </h3>
        <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
          Open the backlog, select 2 or 3 rows via their checkboxes, then
          click "Compare selected →".
        </p>
        <Link
          href="/"
          className="mt-3 inline-flex items-center gap-1.5 rounded-[8px] border px-[13px] py-[7px] text-[13px] no-underline"
          style={{
            background: "var(--panel)",
            color: "var(--ink)",
            borderColor: "var(--rule)",
          }}
        >
          Go to backlog
        </Link>
      </div>
    </div>
  );
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function formatDelta(n: number): string {
  if (Math.abs(n) < 0.05) return "±0.0";
  return (n > 0 ? "+" : "") + n.toFixed(1);
}

function deltaColor(n: number): string {
  if (Math.abs(n) < 0.05) return "var(--muted)";
  return n > 0 ? "var(--score-hi)" : "var(--score-lo)";
}
