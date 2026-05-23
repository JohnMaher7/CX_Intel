import { NextResponse } from "next/server";
import { z } from "zod";
import { newId } from "@/lib/id";
import { saveSession } from "@/lib/storage/sessions";
import { runAnalysisPipeline } from "@/lib/pipeline";
import { type DiscoverySession } from "@/lib/types";

export const runtime = "nodejs";
// The pipeline runs four sequential LLM calls plus N scoring calls; comfortably
// past the App Router's default streaming budget. Bump to the platform max.
export const maxDuration = 300;

const IngestRequestSchema = z.object({
  title: z.string().min(1).max(200),
  raw_text: z.string().min(1),
  supplemental_context: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = IngestRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { title, raw_text, supplemental_context } = parsed.data;

  const session: DiscoverySession = {
    id: newId(),
    title,
    source: "paste",
    ingested_at: new Date().toISOString(),
    raw_text,
    supplemental_context,
  };
  await saveSession(session);

  try {
    const result = await runAnalysisPipeline(session);
    return NextResponse.json({
      session_id: session.id,
      needs_clarification: result.needs_clarification,
    });
  } catch (err) {
    console.error("Ingest pipeline failed:", err);
    return NextResponse.json(
      { error: "Analysis pipeline failed.", detail: errorMessage(err) },
      { status: 500 },
    );
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
