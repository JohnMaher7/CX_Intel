import { generateObject } from "ai";
import { MODEL } from "./client";
import { BriefSectionsSchema } from "./schemas";
import { BRIEF_PROMPT_V1 } from "./prompts";
import { writeBrief } from "@/lib/storage/briefs";
import type { DiscoverySession, Opportunity } from "@/lib/types";

function buildBriefUserMessage(
  opportunity: Pick<
    Opportunity,
    "problem_statement" | "ai_solution_concept"
  >,
  sourceTranscript: string,
): string {
  return `Opportunity:

Problem statement: ${opportunity.problem_statement}

Proposed AI solution: ${opportunity.ai_solution_concept}

Source transcript (the ONLY place to draw the verbatim snippet from):

${sourceTranscript}`;
}

function stitchMarkdown(
  opportunity: Pick<Opportunity, "problem_statement" | "score">,
  sections: { problem: string; solution: string; feasibility_and_effort: string },
): string {
  const score = opportunity.score;
  const header = score
    ? `> **Composite score** ${score.composite.toFixed(2)} / 5  · **Rubric** ${score.rubric_version}`
    : `> _Unscored_`;

  return [
    `# ${opportunity.problem_statement}`,
    "",
    header,
    "",
    "## The Problem",
    "",
    sections.problem,
    "",
    "## The Solution",
    "",
    sections.solution,
    "",
    "## Feasibility & Effort",
    "",
    sections.feasibility_and_effort,
    "",
  ].join("\n");
}

/**
 * Generate the executive brief for an opportunity, persist it to disk, and
 * return the Markdown. Callers (the opportunity detail page) check the disk
 * cache first — this is only invoked on a cache miss.
 *
 * The model produces a structured JSON object via generateObject; the
 * Markdown skeleton (headings, metadata header) is assembled in TS so the
 * layout is fixed and prompt changes can't reorder sections.
 */
export async function generateBrief(
  opportunity: Opportunity,
  session: DiscoverySession,
): Promise<string> {
  const userMessage = buildBriefUserMessage(opportunity, session.raw_text);

  const result = await generateObject({
    model: MODEL,
    schema: BriefSectionsSchema,
    system: BRIEF_PROMPT_V1,
    prompt: userMessage,
    temperature: 0.3,
  });

  const markdown = stitchMarkdown(opportunity, result.object);
  await writeBrief(opportunity.id, markdown);
  return markdown;
}
