import { generateObject } from "ai";
import { MODEL } from "./client";
import { SessionBriefSectionsSchema } from "./schemas";
import { SESSION_BRIEF_PROMPT_V1 } from "./prompts";
import { writeSessionBrief } from "@/lib/storage/session-briefs";
import type { DiscoverySession, Opportunity } from "@/lib/types";

const MAX_OPPORTUNITIES = 3;

function buildUserMessage(
  session: DiscoverySession,
  rankedOpportunities: Opportunity[],
): string {
  const oppBlocks = rankedOpportunities
    .map((o, idx) => {
      const composite = o.score
        ? o.score.composite.toFixed(2)
        : "unscored";
      return `Opportunity ${idx + 1} (composite ${composite}):
Problem statement: ${o.problem_statement}
Proposed AI solution: ${o.ai_solution_concept}`;
    })
    .join("\n\n");

  return `Session: ${session.title}

Top opportunities (already ranked by composite score, highest first):

${oppBlocks}

Source transcript (the ONLY place to draw verbatim snippets and concrete numbers from):

${session.raw_text}`;
}

function stitchMarkdown(
  session: DiscoverySession,
  rankedOpportunities: Opportunity[],
  sections: {
    executive_summary: string;
    top_opportunities: Array<{ headline: string; why_it_matters: string }>;
    recommended_next_step: string;
  },
): string {
  const count = rankedOpportunities.length;
  const heading = count === 1 ? "The biggest opportunity" : `The ${count === 2 ? "two" : "three"} biggest opportunities`;

  const oppBlocks = sections.top_opportunities
    .map((s, idx) => {
      const opp = rankedOpportunities[idx];
      const scoreLine = opp?.score
        ? ` · composite ${opp.score.composite.toFixed(2)}`
        : "";
      return `### ${idx + 1}. ${s.headline}${scoreLine}\n\n${s.why_it_matters}`;
    })
    .join("\n\n");

  return [
    `# Executive brief — ${session.title}`,
    "",
    `> Synthesised from ${count} AI-solvable ${count === 1 ? "opportunity" : "opportunities"}, ranked by composite score.`,
    "",
    "## Where the team is bleeding value",
    "",
    sections.executive_summary,
    "",
    `## ${heading}`,
    "",
    oppBlocks,
    "",
    "## Recommended next step",
    "",
    sections.recommended_next_step,
    "",
  ].join("\n");
}

/**
 * Generate the session-level executive brief from the top-ranked
 * opportunities for a session, persist it to disk, and return the
 * Markdown. Caller passes already-scored, already-sorted opportunities;
 * we cap at the top 3.
 *
 * Returns null if there are no scored opportunities — the session has
 * nothing to brief on.
 */
export async function generateSessionBrief(
  session: DiscoverySession,
  rankedOpportunities: Opportunity[],
): Promise<string | null> {
  const topN = rankedOpportunities
    .filter((o) => o.score)
    .slice(0, MAX_OPPORTUNITIES);

  if (topN.length === 0) return null;

  const userMessage = buildUserMessage(session, topN);

  const result = await generateObject({
    model: MODEL,
    schema: SessionBriefSectionsSchema,
    system: SESSION_BRIEF_PROMPT_V1,
    prompt: userMessage,
    temperature: 0.3,
  });

  // The model is instructed to return one entry per input opportunity, in
  // the same order. If it returns more, trim; if fewer, the markdown stitch
  // will only render the ones we got — but the prompt is explicit so this
  // should not happen in practice.
  const sections = {
    executive_summary: result.object.executive_summary,
    top_opportunities: result.object.top_opportunities.slice(0, topN.length),
    recommended_next_step: result.object.recommended_next_step,
  };

  const markdown = stitchMarkdown(session, topN, sections);
  await writeSessionBrief(session.id, markdown);
  return markdown;
}
