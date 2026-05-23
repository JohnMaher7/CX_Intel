import Link from "next/link";
import { notFound } from "next/navigation";
import { Quote } from "lucide-react";
import { Breadcrumb } from "@/components/topbar";
import { AtlasPill } from "@/components/atlas-pill";
import { AIChip } from "@/components/ai-chip";
import { CopyButton } from "@/components/copy-button";
import {
  CompositeTile,
  DimensionsCard,
  SubScoresAside,
} from "@/components/score-breakdown";
import { BriefViewer } from "@/components/brief-viewer";
import { getOpportunity } from "@/lib/storage/opportunities";
import { getSession } from "@/lib/storage/sessions";
import { readBrief } from "@/lib/storage/briefs";
import { generateBrief } from "@/lib/ai/generate-brief";

export const dynamic = "force-dynamic";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  if (!opportunity) notFound();

  const session = await getSession(opportunity.session_id);
  if (!session) notFound();

  const bottleneck = session.bottlenecks?.find(
    (b) => b.id === opportunity.bottleneck_id,
  );

  const cached = await readBrief(id);
  const brief = cached ?? (await generateBrief(opportunity, session));
  const score = opportunity.score;

  return (
    <>
      <Breadcrumb
        segments={[
          { label: "Backlog", href: "/" },
          { label: session.title, href: `/sessions/${session.id}` },
        ]}
      />
      <div
        className="grid grid-cols-1 items-start gap-7 border-b px-7 pb-[22px] pt-3.5 lg:grid-cols-[1fr_auto]"
        style={{ borderColor: "var(--rule)" }}
      >
        <div>
          <div className="flex flex-wrap gap-2">
            <AtlasPill>{opportunity.id}</AtlasPill>
            {bottleneck?.stage && <AtlasPill>{bottleneck.stage}</AtlasPill>}
            {(bottleneck?.ai_solvable ?? true) && <AIChip />}
          </div>
          <h1
            className="font-editorial mt-2.5 max-w-[720px] text-[30px] font-normal leading-tight"
            style={{
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}
          >
            {opportunity.problem_statement}
          </h1>
          <div className="mt-3.5 flex flex-wrap gap-3">
            <Link
              href={`/compare?ids=${opportunity.id}`}
              className="inline-flex items-center gap-1.5 rounded-[8px] border px-[13px] py-[7px] text-[13px] no-underline"
              style={{
                background: "var(--panel)",
                color: "var(--ink)",
                borderColor: "var(--rule)",
              }}
            >
              Compare with another
            </Link>
            <button
              className="inline-flex items-center gap-1.5 rounded-[8px] border px-[13px] py-[7px] text-[13px]"
              style={{
                background: "var(--panel)",
                color: "var(--ink)",
                borderColor: "var(--rule)",
              }}
            >
              Add to roadmap
            </button>
            <CopyButton text={brief} label="Export brief" variant="primary" />
          </div>
        </div>
        {score && <CompositeTile score={score} />}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 px-7 pb-5 pt-[18px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col gap-3.5">
          {bottleneck && (
            <div
              className="rounded-[12px] border bg-card p-5"
              style={{ borderColor: "var(--rule)" }}
            >
              <div
                className="mb-2.5 text-[11.5px] font-medium uppercase tracking-[0.06em]"
                style={{ color: "var(--muted)" }}
              >
                Evidence
              </div>
              <figure className="m-0 flex gap-3.5">
                <Quote
                  className="mt-1 h-[22px] w-[22px] flex-shrink-0"
                  style={{ color: "var(--accent)" }}
                />
                <div>
                  <blockquote
                    className="font-editorial m-0 text-[19px] leading-snug"
                    style={{ color: "var(--ink)", lineHeight: 1.4 }}
                  >
                    &ldquo;{bottleneck.evidence_quote}&rdquo;
                  </blockquote>
                  <figcaption
                    className="mt-2.5 text-[12px]"
                    style={{ color: "var(--muted)" }}
                  >
                    From transcript · {bottleneck.stage}
                  </figcaption>
                </div>
              </figure>
            </div>
          )}

          <div
            className="rounded-[12px] border bg-card p-5"
            style={{ borderColor: "var(--rule)" }}
          >
            <div
              className="mb-2.5 text-[11.5px] font-medium uppercase tracking-[0.06em]"
              style={{ color: "var(--muted)" }}
            >
              Why this is AI-solvable
            </div>
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: "var(--ink)", lineHeight: 1.55 }}
            >
              {opportunity.ai_solution_concept}
            </p>
          </div>

          {score && <DimensionsCard score={score} />}

          <div
            className="rounded-[12px] border bg-card p-5"
            style={{ borderColor: "var(--rule)" }}
          >
            <div
              className="mb-3 text-[11.5px] font-medium uppercase tracking-[0.06em]"
              style={{ color: "var(--muted)" }}
            >
              Executive brief
            </div>
            <BriefViewer markdown={brief} />
          </div>
        </section>

        {score ? (
          <SubScoresAside score={score} />
        ) : (
          <aside
            className="rounded-[12px] border bg-card p-5"
            style={{ borderColor: "var(--rule)" }}
          >
            <p className="text-[13px]" style={{ color: "var(--muted)" }}>
              This opportunity has not been scored yet.
            </p>
          </aside>
        )}
      </div>
    </>
  );
}
