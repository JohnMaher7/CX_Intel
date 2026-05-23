import Link from "next/link";
import { Inbox, PlusCircle, Search } from "lucide-react";
import { Topbar } from "@/components/topbar";
import {
  OpportunityBoard,
  type RankedOpportunity,
} from "@/components/opportunity-table";
import { listOpportunities } from "@/lib/storage/opportunities";
import { listSessions } from "@/lib/storage/sessions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [allOpps, sessions] = await Promise.all([
    listOpportunities(),
    listSessions(),
  ]);

  const sessionsById = new Map(sessions.map((s) => [s.id, s]));

  const ranked: RankedOpportunity[] = allOpps
    .filter((o): o is RankedOpportunity => Boolean(o.score))
    .map((o) => {
      const session = sessionsById.get(o.session_id);
      const bottleneck = session?.bottlenecks?.find(
        (b) => b.id === o.bottleneck_id,
      );
      return {
        ...o,
        stage: bottleneck?.stage,
        ai_solvable: bottleneck?.ai_solvable ?? true,
      };
    })
    .sort((a, b) => b.score.composite - a.score.composite);

  const sessionTitle = Object.fromEntries(
    sessions.map((s) => [s.id, s.title]),
  );

  const total = ranked.length;
  const aiSolvable = ranked.filter((o) => o.ai_solvable !== false).length;
  const top = ranked[0];
  const sessionCount = sessions.length;

  if (total === 0) {
    return (
      <>
        <Topbar
          title="Opportunity backlog"
          subtitle="Ranked AI automation opportunities extracted from CX discovery sessions."
          right={
            <Link
              href="/sessions/new"
              className="inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-[7px] text-[13px] font-medium text-white no-underline"
              style={{ background: "var(--accent)" }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New session
            </Link>
          }
        />
        <div className="mx-7 mt-6 flex flex-col items-start gap-3 rounded-[12px] border border-dashed p-6"
          style={{ borderColor: "var(--rule)" }}>
          <div className="flex items-center gap-2 text-[14px] font-medium" style={{ color: "var(--ink)" }}>
            <Inbox className="h-4 w-4" style={{ color: "var(--muted)" }} />
            No opportunities yet
          </div>
          <p className="text-[13.5px]" style={{ color: "var(--muted)" }}>
            Ingest a discovery session to begin. The pipeline will extract
            bottlenecks, score each one against the rubric, and surface the
            highest-impact AI opportunities here.
          </p>
          <Link
            href="/sessions/new"
            className="inline-flex items-center gap-1.5 rounded-[8px] border px-[13px] py-[7px] text-[13px] no-underline"
            style={{
              background: "var(--panel)",
              color: "var(--ink)",
              borderColor: "var(--rule)",
            }}
          >
            Ingest your first session
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Opportunity backlog"
        subtitle={`${total} ranked candidate${total === 1 ? "" : "s"} across ${sessionCount} discovery session${sessionCount === 1 ? "" : "s"}. Composite score blends impact, feasibility, and cost (rubric ${top.score.rubric_version}).`}
        right={
          <>
            <button
              className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12.5px]"
              style={{ color: "var(--ink-soft)" }}
            >
              <Search className="h-3.5 w-3.5" />
              Find
            </button>
            <Link
              href="/sessions/new"
              className="inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-[7px] text-[13px] font-medium text-white no-underline"
              style={{ background: "var(--accent)" }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New session
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 px-7 pb-2.5 pt-[18px] sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          big={total}
          label="opportunities"
          sub={`across ${sessionCount} session${sessionCount === 1 ? "" : "s"}`}
        />
        <Kpi
          big={aiSolvable}
          label="AI-solvable"
          sub={total > 0 ? `${Math.round((aiSolvable / total) * 100)}% of total` : ""}
          tone="signal"
        />
        <Kpi
          big={top.score.composite.toFixed(1)}
          label="top composite"
          sub={truncate(top.problem_statement, 48)}
          tone="accent"
        />
        <Kpi
          big={sessionCount}
          label="sessions"
          sub="newest first in sidebar"
        />
      </div>

      <OpportunityBoard opportunities={ranked} sessionTitle={sessionTitle} />
    </>
  );
}

function Kpi({
  big,
  label,
  sub,
  tone,
}: {
  big: React.ReactNode;
  label: string;
  sub?: string;
  tone?: "default" | "accent" | "signal";
}) {
  const color =
    tone === "accent"
      ? "var(--accent)"
      : tone === "signal"
        ? "var(--signal)"
        : "var(--ink)";
  return (
    <div
      className="rounded-[12px] border bg-card px-4 py-3.5"
      style={{ borderColor: "var(--rule)" }}
    >
      <div className="text-[11.5px] capitalize" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div
        className="mt-0.5 text-[30px] font-semibold leading-none"
        style={{ color, letterSpacing: "-0.02em" }}
      >
        {big}
      </div>
      {sub && (
        <div className="mt-1 text-[11.5px]" style={{ color: "var(--muted-2)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}
