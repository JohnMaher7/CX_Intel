import { generateObject } from "ai";
import { MODEL } from "./client";
import { ScoreOutputSchema } from "./schemas";
import { SCORING_PROMPT_V1 } from "./prompts";
import { RUBRIC_V1, type DimensionName } from "../scoring/rubric";
import { computeComposite, meanSubScores } from "../scoring/composite";
import type { Opportunity, Score } from "../types";

function buildScoringUserMessage(
  opportunity: Pick<
    Opportunity,
    "problem_statement" | "ai_solution_concept"
  >,
  sourceTranscript: string,
): string {
  return `Opportunity to score:

Problem statement: ${opportunity.problem_statement}

Proposed AI solution: ${opportunity.ai_solution_concept}

Source transcript (use ONLY this text for evidence_quote fields):

${sourceTranscript}`;
}

/**
 * Score an Opportunity against RUBRIC_V1.
 *
 * `temperature: 0` requests greedy decoding from the model. Combined with a
 * tight schema and a fixed prompt this gets us close to deterministic JSON
 * outputs — close enough that identical inputs produce identical composites
 * in practice. See notes/temperature-and-determinism.md.
 *
 * The composite is computed in TypeScript from the model's sub-scores. The
 * LLM never sees or emits the composite, which keeps the maths auditable
 * and means a rubric change does not require re-prompting historical data.
 */
export async function scoreOpportunity(
  opportunity: Pick<
    Opportunity,
    "problem_statement" | "ai_solution_concept"
  >,
  sourceTranscript: string,
): Promise<Score> {
  const userMessage = buildScoringUserMessage(opportunity, sourceTranscript);

  const result = await generateObject({
    model: MODEL,
    schema: ScoreOutputSchema,
    system: SCORING_PROMPT_V1,
    prompt: userMessage,
    temperature: 0,
  });

  const dimensions = {} as Score["dimensions"];
  for (const dimName of Object.keys(RUBRIC_V1.dimensions) as DimensionName[]) {
    const expected = RUBRIC_V1.dimensions[dimName].sub_criteria;
    const subScores = result.object.dimensions[dimName].sub_scores;

    const got = subScores.map((s) => s.name);
    const missing = expected.filter((n) => !got.includes(n));
    if (missing.length > 0) {
      throw new Error(
        `Scoring output for "${dimName}" is missing sub_criteria: ${missing.join(", ")}. Got: ${got.join(", ")}`,
      );
    }

    dimensions[dimName] = {
      dimension_score: meanSubScores(subScores),
      sub_scores: subScores,
    };
  }

  const score: Score = {
    rubric_version: RUBRIC_V1.version,
    dimensions,
    composite: 0,
  };
  score.composite = computeComposite(score);
  return score;
}
