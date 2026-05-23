import { newId } from "./id";
import { saveSession } from "./storage/sessions";
import { saveOpportunity } from "./storage/opportunities";
import { analyzeSession } from "./ai/analyze-session";
import { scoreOpportunity } from "./ai/score-opportunity";
import { generateSessionBrief } from "./ai/generate-session-brief";
import {
  type Bottleneck,
  type ClarifyingQuestion,
  type DiscoverySession,
  type Opportunity,
} from "./types";

export type AnalysisPipelineResult = { needs_clarification: boolean };

/**
 * Run analyze → (optional) score → persist for a session whose `raw_text`
 * is already saved. Used by both the initial ingest route and the
 * clarifying-answers route, which re-runs the pipeline against an
 * augmented `raw_text`.
 */
export async function runAnalysisPipeline(
  session: DiscoverySession,
): Promise<AnalysisPipelineResult> {
  const analysis = await analyzeSession(
    session.raw_text,
    session.supplemental_context,
  );

  if (analysis.clarifying.needs_clarification) {
    const clarifying_questions: ClarifyingQuestion[] =
      analysis.clarifying.questions.map((q) => ({
        id: newId(),
        status: "open",
        question: q.question,
        why_needed: q.why_needed,
      }));

    await saveSession({
      ...session,
      workflow: undefined,
      bottlenecks: undefined,
      clarifying_questions,
    });
    return { needs_clarification: true };
  }

  const bottlenecks: Bottleneck[] = analysis.bottlenecks.bottlenecks.map(
    (b) => ({
      id: newId(),
      stage: b.stage,
      description: b.description,
      evidence_quote: b.evidence_quote,
      ai_solvable: b.ai_solvable,
      ai_solvable_reasoning: b.ai_solvable_reasoning,
    }),
  );

  await saveSession({
    ...session,
    workflow: analysis.workflow,
    bottlenecks,
    clarifying_questions: undefined,
  });

  const solvable = bottlenecks.filter((b) => b.ai_solvable);
  const scoredOpportunities = await Promise.all(
    solvable.map(async (b) => {
      const opp: Opportunity = {
        id: newId(),
        session_id: session.id,
        bottleneck_id: b.id,
        problem_statement: b.description,
        ai_solution_concept: b.ai_solvable_reasoning,
        created_at: new Date().toISOString(),
      };
      const score = await scoreOpportunity(opp, session.raw_text);
      const persisted: Opportunity = { ...opp, score };
      await saveOpportunity(persisted);
      return persisted;
    }),
  );

  const ranked = scoredOpportunities
    .filter((o) => o.score)
    .sort((a, b) => b.score!.composite - a.score!.composite);

  if (ranked.length > 0) {
    const sessionWithAnalysis: DiscoverySession = {
      ...session,
      workflow: analysis.workflow,
      bottlenecks,
      clarifying_questions: undefined,
    };
    await generateSessionBrief(sessionWithAnalysis, ranked);
  }

  return { needs_clarification: false };
}
