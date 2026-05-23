import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Topbar, Breadcrumb } from "@/components/topbar";
import { BottleneckList } from "@/components/bottleneck-list";
import { ClarifyingQuestionsCallout } from "@/components/clarifying-questions-callout";
import { BriefViewer } from "@/components/brief-viewer";
import { CopyButton } from "@/components/copy-button";
import { getSession } from "@/lib/storage/sessions";
import { listOpportunities } from "@/lib/storage/opportunities";
import { readSessionBrief } from "@/lib/storage/session-briefs";
import { generateSessionBrief } from "@/lib/ai/generate-session-brief";
import { type DiscoverySession, type Opportunity, type WorkflowMap } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) notFound();

  const allOpportunities = await listOpportunities();
  const opportunities = allOpportunities.filter((o) => o.session_id === id);

  const scored = opportunities.filter((o) => o.score);
  scored.sort((a, b) => (b.score!.composite - a.score!.composite));
  const top = scored[0];

  // Eager generation happens in the ingest pipeline; this lazy backfill
  // covers sessions ingested before the session-brief feature existed.
  let sessionBrief = await readSessionBrief(session.id);
  if (!sessionBrief && scored.length > 0) {
    sessionBrief = await generateSessionBrief(session, scored);
  }

  const openClarifying = (session.clarifying_questions ?? []).filter(
    (q) => q.status === "open",
  );
  const hasAnalysis =
    (session.workflow?.stages.length ?? 0) > 0 ||
    (session.bottlenecks?.length ?? 0) > 0;
  const wordCount = countWords(session.raw_text);
  const briefMeta = formatTimestamp(session.ingested_at);

  return (
    <>
      <Breadcrumb
        segments={[
          { label: "Sessions", href: "/sessions" },
          { label: session.title },
        ]}
      />
      <Topbar
        title={session.title}
        subtitle={`Ingested ${briefMeta} · source ${session.source} · ${formatNum(wordCount)} words. ${
          hasAnalysis
            ? `Pipeline extracted ${session.bottlenecks?.length ?? 0} bottleneck${(session.bottlenecks?.length ?? 0) === 1 ? "" : "s"} (${(session.bottlenecks ?? []).filter((b) => b.ai_solvable).length} AI-solvable).`
            : "Analysis not yet run."
        }`}
        right={
          <>
            <a
              href="#transcript"
              className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12.5px] no-underline"
              style={{ color: "var(--ink-soft)" }}
            >
              View transcript
            </a>
            {sessionBrief && (
              <CopyButton
                text={sessionBrief}
                label="Export brief"
                variant="primary"
              />
            )}
          </>
        }
      />

      {openClarifying.length > 0 && (
        <div className="px-7 pt-5">
          <ClarifyingQuestionsCallout
            sessionId={session.id}
            questions={session.clarifying_questions ?? []}
          />
        </div>
      )}

      {hasAnalysis && session.workflow && (
        <div className="px-7 pb-2.5 pt-[18px]">
          <div
            className="mb-2 text-[11.5px] font-medium"
            style={{ color: "var(--muted)" }}
          >
            Workflow
          </div>
          <WorkflowStrip workflow={session.workflow} />
        </div>
      )}

      {hasAnalysis && (
        <div className="grid flex-1 grid-cols-1 gap-4 px-7 pb-5 pt-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <section
            className="rounded-[12px] border bg-card p-5"
            style={{ borderColor: "var(--rule)" }}
          >
            <div className="mb-3.5 flex items-baseline justify-between">
              <h2
                className="text-[16px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Bottlenecks{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                  · {session.bottlenecks?.length ?? 0}
                </span>
              </h2>
            </div>
            <BottleneckList bottlenecks={session.bottlenecks ?? []} />
          </section>

          <aside
            className="rounded-[12px] border bg-card p-5 overflow-hidden"
            style={{ borderColor: "var(--rule)" }}
          >
            {sessionBrief ? (
              <BriefPanel
                sessionBrief={sessionBrief}
                topOpportunityId={top?.id}
                opportunityCount={scored.length}
                generatedAt={briefMeta}
              />
            ) : (
              <BriefPanelEmpty hasScored={scored.length > 0} />
            )}
          </aside>
        </div>
      )}

      <section id="transcript" className="px-7 pb-8 pt-2">
        <SectionHeading
          title="Transcript"
          description="The text the pipeline was given, exactly as stored."
        />
        <div
          className="mt-3 rounded-[12px] border bg-card p-5"
          style={{ borderColor: "var(--rule)" }}
        >
          <pre
            className="max-h-96 overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {session.raw_text}
          </pre>
        </div>
        {session.supplemental_context && (
          <div
            className="mt-3 rounded-[12px] border bg-card p-5"
            style={{ borderColor: "var(--rule)" }}
          >
            <div
              className="mb-2 text-[11.5px] uppercase tracking-[0.06em]"
              style={{ color: "var(--muted)" }}
            >
              Supplemental context
            </div>
            <pre
              className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              {session.supplemental_context}
            </pre>
          </div>
        )}
      </section>
    </>
  );
}

function BriefPanel({
  sessionBrief,
  topOpportunityId,
  opportunityCount,
  generatedAt,
}: {
  sessionBrief: string;
  topOpportunityId: string | undefined;
  opportunityCount: number;
  generatedAt: string;
}) {
  const synthesisedFrom = Math.min(opportunityCount, 3);
  return (
    <>
      <div className="mb-3.5 flex items-center gap-2">
        <div
          className="grid h-7 w-7 place-items-center rounded-[8px]"
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent-ink)",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="leading-tight">
          <h2
            className="text-[15px] font-semibold"
            style={{ color: "var(--ink)" }}
          >
            Executive brief
          </h2>
          <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>
            Session synthesis · top {synthesisedFrom} {synthesisedFrom === 1 ? "opportunity" : "opportunities"} · {generatedAt}
          </p>
        </div>
        <div className="flex-1" />
        <CopyButton text={sessionBrief} />
      </div>

      <div
        className="max-h-[420px] overflow-y-auto pr-1"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 92%, transparent 100%)",
        }}
      >
        <BriefViewer markdown={sessionBrief} />
      </div>

      {topOpportunityId && (
        <div
          className="mt-4 rounded-[10px] border p-3.5"
          style={{
            background: "var(--accent-soft)",
            borderColor:
              "color-mix(in oklch, var(--accent) 25%, transparent)",
          }}
        >
          <div
            className="text-[11.5px] font-semibold"
            style={{ color: "var(--accent-ink)" }}
          >
            Drill into the top opportunity
          </div>
          <p
            className="mt-1 text-[13.5px] leading-relaxed"
            style={{ color: "var(--ink)" }}
          >
            Inspect the per-dimension scoring evidence and the full
            single-opportunity brief.
          </p>
          <Link
            href={`/opportunities/${topOpportunityId}`}
            className="mt-2 inline-flex items-center gap-1 text-[12.5px] no-underline"
            style={{ color: "var(--accent-ink)" }}
          >
            Open opportunity →
          </Link>
        </div>
      )}
    </>
  );
}

function BriefPanelEmpty({ hasScored }: { hasScored: boolean }) {
  return (
    <div>
      <div className="mb-3.5 flex items-center gap-2">
        <div
          className="grid h-7 w-7 place-items-center rounded-[8px]"
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent-ink)",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <h2
          className="text-[15px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          Executive brief
        </h2>
      </div>
      <p className="text-[13px]" style={{ color: "var(--muted)" }}>
        {hasScored
          ? "Open an opportunity to generate its brief on first load."
          : "No scored opportunities yet for this session."}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2
        className="text-[16px] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        {title}
      </h2>
      <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
        {description}
      </p>
    </div>
  );
}

function WorkflowStrip({ workflow }: { workflow: WorkflowMap }) {
  return (
    <ol className="m-0 flex list-none items-center gap-0 p-0">
      {workflow.stages.map((stage, idx) => (
        <li
          key={`${stage.name}-${idx}`}
          className="flex flex-1 items-center"
        >
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="grid h-8 w-8 place-items-center rounded-full text-[12.5px] font-medium"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--rule)",
                color: "var(--ink-soft)",
              }}
            >
              {idx + 1}
            </div>
            <div
              className="text-center text-[12px]"
              style={{ color: "var(--muted)", maxWidth: 140 }}
              title={stage.description}
            >
              {stage.name}
            </div>
          </div>
          {idx < workflow.stages.length - 1 && (
            <div
              className="mx-1 h-px flex-1"
              style={{ background: "var(--rule)", marginBottom: 22 }}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
