import Link from "next/link";
import { Inbox, PlusCircle, ArrowRight } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { AtlasPill } from "@/components/atlas-pill";
import { listSessions } from "@/lib/storage/sessions";
import { type DiscoverySession } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Discovery sessions",
};

export default async function SessionsPage() {
  const sessions = await listSessions();
  sessions.sort((a, b) => b.ingested_at.localeCompare(a.ingested_at));

  return (
    <>
      <Topbar
        title="Sessions"
        subtitle="Every discovery conversation ingested into the workbench, newest first."
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

      <div className="px-7 pb-5 pt-[18px]">
        {sessions.length === 0 ? (
          <div
            className="flex flex-col items-start gap-3 rounded-[12px] border border-dashed p-6"
            style={{ borderColor: "var(--rule)" }}
          >
            <div
              className="flex items-center gap-2 text-[14px] font-medium"
              style={{ color: "var(--ink)" }}
            >
              <Inbox className="h-4 w-4" style={{ color: "var(--muted)" }} />
              No sessions yet
            </div>
            <p className="text-[13.5px]" style={{ color: "var(--muted)" }}>
              Ingest a discovery transcript to populate the workbench.
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
        ) : (
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SessionCard({ session }: { session: DiscoverySession }) {
  const bottleneckCount = session.bottlenecks?.length ?? 0;
  const aiSolvable =
    session.bottlenecks?.filter((b) => b.ai_solvable).length ?? 0;
  const wordCount = countWords(session.raw_text);
  const wordLabel =
    wordCount >= 1000 ? `${(wordCount / 1000).toFixed(1)}k` : `${wordCount}`;
  const openClarifying =
    session.clarifying_questions?.filter((q) => q.status === "open").length ??
    0;

  return (
    <div
      className="rounded-[12px] border bg-card p-[18px]"
      style={{ borderColor: "var(--rule)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <AtlasPill>{session.source}</AtlasPill>
          <h3
            className="mt-2 text-[15.5px] font-semibold"
            style={{ color: "var(--ink)", letterSpacing: "-0.005em" }}
          >
            <Link
              href={`/sessions/${session.id}`}
              className="no-underline hover:underline"
              style={{ color: "var(--ink)" }}
            >
              {session.title}
            </Link>
          </h3>
          {openClarifying > 0 && (
            <p
              className="mt-1 text-[12.5px] font-medium"
              style={{ color: "var(--accent-ink)" }}
            >
              {openClarifying} clarifying question
              {openClarifying === 1 ? "" : "s"} pending
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px]" style={{ color: "var(--muted)" }}>
            {formatDate(session.ingested_at)}
          </div>
          <div
            className="mt-0.5 text-[11px]"
            style={{ color: "var(--muted)" }}
          >
            {formatTime(session.ingested_at)}
          </div>
        </div>
      </div>
      <div
        className="mt-3.5 flex items-end gap-3.5 border-t pt-3"
        style={{ borderColor: "var(--rule-soft)" }}
      >
        <Stat n={bottleneckCount} l="bottlenecks" />
        <Stat n={aiSolvable} l="AI-solvable" color="var(--signal)" />
        <Stat n={wordLabel} l="words" />
        <div className="flex-1" />
        <Link
          href={`/sessions/${session.id}`}
          className="inline-flex items-center gap-1 self-center text-[12.5px] no-underline"
          style={{ color: "var(--accent)" }}
        >
          Open <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Stat({
  n,
  l,
  color,
}: {
  n: number | string;
  l: string;
  color?: string;
}) {
  return (
    <div>
      <div
        className="text-[16px] font-semibold"
        style={{ color: color ?? "var(--ink)" }}
      >
        {n}
      </div>
      <div
        className="mt-px text-[11px]"
        style={{ color: "var(--muted)" }}
      >
        {l}
      </div>
    </div>
  );
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
