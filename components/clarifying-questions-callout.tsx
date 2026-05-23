"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Loader2 } from "lucide-react";
import { type ClarifyingQuestion } from "@/lib/types";

export function ClarifyingQuestionsCallout({
  sessionId,
  questions,
}: {
  sessionId: string;
  questions: ClarifyingQuestion[];
}) {
  const router = useRouter();
  const openQuestions = questions.filter((q) => q.status === "open");
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (openQuestions.length === 0) return null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = openQuestions
      .map((q) => ({ id: q.id, answer: (answers[q.id] ?? "").trim() }))
      .filter((a) => a.answer.length > 0);

    if (payload.length === 0) {
      setError("Answer at least one question before re-running the analysis.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      if (!res.ok) {
        const detail = await safeReadError(res);
        throw new Error(detail);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="rounded-[12px] border p-5"
      style={{
        background: "var(--accent-soft)",
        borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)",
      }}
    >
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4" style={{ color: "var(--accent-ink)" }} />
        <h3
          className="text-[15px] font-semibold"
          style={{ color: "var(--accent-ink)" }}
        >
          The transcript needs more detail before scoring.
        </h3>
      </div>
      <p
        className="mt-1 text-[13px] leading-relaxed"
        style={{ color: "var(--ink-soft)" }}
      >
        The analyser found this session too thin to extract a confident
        workflow or bottleneck list. Answer the questions below and the
        pipeline will re-run with your additions appended.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        {openQuestions.map((q) => (
          <div key={q.id} className="flex flex-col gap-1.5">
            <label
              htmlFor={`answer-${q.id}`}
              className="text-[13px] font-medium"
              style={{ color: "var(--ink)" }}
            >
              {q.question}
            </label>
            <p className="text-[12px]" style={{ color: "var(--muted)" }}>
              {q.why_needed}
            </p>
            <textarea
              id={`answer-${q.id}`}
              value={answers[q.id] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              disabled={submitting}
              style={{
                width: "100%",
                border: "1px solid var(--rule)",
                background: "var(--panel)",
                padding: "10px 12px",
                borderRadius: 10,
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                color: "var(--ink)",
                outline: "none",
                minHeight: 80,
                resize: "vertical",
              }}
            />
          </div>
        ))}

        {error && (
          <p className="text-[12px]" style={{ color: "var(--score-lo)" }} role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-[7px] text-[13px] font-medium text-white disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {submitting ? "Re-running analysis…" : "Submit answers"}
          </button>
          {submitting && (
            <p className="text-[12px]" style={{ color: "var(--muted)" }}>
              Same four-step pipeline, this time with your context appended.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

async function safeReadError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; detail?: string };
    if (body.detail) return `${body.error ?? "Error"}: ${body.detail}`;
    if (body.error) return body.error;
  } catch {
    // fall through
  }
  return `Request failed with status ${res.status}`;
}
