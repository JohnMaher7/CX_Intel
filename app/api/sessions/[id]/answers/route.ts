import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, saveSession } from "@/lib/storage/sessions";
import { runAnalysisPipeline } from "@/lib/pipeline";
import { type ClarifyingQuestion, type DiscoverySession } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const AnswerSchema = z.object({
  id: z.string().min(1),
  answer: z.string().min(1),
});

const AnswersRequestSchema = z.object({
  answers: z.array(AnswerSchema).min(1),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = AnswersRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const openQuestions = (session.clarifying_questions ?? []).filter(
    (q): q is Extract<ClarifyingQuestion, { status: "open" }> =>
      q.status === "open",
  );
  if (openQuestions.length === 0) {
    return NextResponse.json(
      { error: "This session has no open clarifying questions." },
      { status: 400 },
    );
  }

  const answersById = new Map(parsed.data.answers.map((a) => [a.id, a.answer]));
  const updatedQuestions: ClarifyingQuestion[] = (
    session.clarifying_questions ?? []
  ).map((q) => {
    if (q.status === "answered") return q;
    const answer = answersById.get(q.id);
    if (!answer) return q;
    return {
      id: q.id,
      status: "answered" as const,
      question: q.question,
      why_needed: q.why_needed,
      answer,
    };
  });

  const appended = buildClarifyingAppendix(
    updatedQuestions.filter(
      (q): q is Extract<ClarifyingQuestion, { status: "answered" }> =>
        q.status === "answered",
    ),
  );

  const updated: DiscoverySession = {
    ...session,
    raw_text: `${session.raw_text}\n\n${appended}`,
    clarifying_questions: updatedQuestions,
  };
  await saveSession(updated);

  try {
    const result = await runAnalysisPipeline(updated);
    return NextResponse.json({
      session_id: updated.id,
      needs_clarification: result.needs_clarification,
    });
  } catch (err) {
    console.error("Re-analysis pipeline failed:", err);
    return NextResponse.json(
      { error: "Analysis pipeline failed.", detail: errorMessage(err) },
      { status: 500 },
    );
  }
}

function buildClarifyingAppendix(
  answered: Array<Extract<ClarifyingQuestion, { status: "answered" }>>,
): string {
  const lines = ["## Clarifying answers", ""];
  for (const q of answered) {
    lines.push(`**Q:** ${q.question}`);
    lines.push(`**A:** ${q.answer}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
