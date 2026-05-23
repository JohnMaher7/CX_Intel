import { z } from "zod";

/**
 * AI-output schemas: what the model emits BEFORE we add IDs, timestamps,
 * or persistence-only fields. Keep these intentionally narrower than the
 * domain schemas in lib/types.ts.
 */

export const WorkflowStageOutputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  actors: z.array(z.string().min(1)),
});
export type WorkflowStageOutput = z.infer<typeof WorkflowStageOutputSchema>;

export const WorkflowMapSchema = z.object({
  stages: z.array(WorkflowStageOutputSchema).min(1),
});
export type WorkflowMapOutput = z.infer<typeof WorkflowMapSchema>;

export const BottleneckOutputSchema = z.object({
  stage: z.string().min(1),
  description: z.string().min(1),
  evidence_quote: z.string().min(10),
  ai_solvable: z.boolean(),
  ai_solvable_reasoning: z.string().min(1),
});
export type BottleneckOutput = z.infer<typeof BottleneckOutputSchema>;

export const BottleneckListSchema = z.object({
  bottlenecks: z.array(BottleneckOutputSchema),
});
export type BottleneckListOutput = z.infer<typeof BottleneckListSchema>;

export const ClarifyingQuestionOutputSchema = z.object({
  question: z.string().min(1),
  why_needed: z.string().min(1),
});
export type ClarifyingQuestionOutput = z.infer<
  typeof ClarifyingQuestionOutputSchema
>;

export const ClarifyingQuestionsSchema = z.object({
  needs_clarification: z.boolean(),
  questions: z.array(ClarifyingQuestionOutputSchema),
});
export type ClarifyingQuestionsOutput = z.infer<
  typeof ClarifyingQuestionsSchema
>;

/* ---------- Scoring (AI output shape) ---------- */

/**
 * AI-output ScoreSchema. The model returns per-sub-criterion scores grounded
 * in verbatim transcript quotes. We compute dimension means and the weighted
 * composite in TypeScript (lib/scoring/composite.ts) and stamp the
 * rubric_version after the call, so neither lives in the LLM output.
 */
export const SubScoreOutputSchema = z.object({
  name: z.string().min(1),
  score: z.number().int().min(1).max(5),
  rationale: z.string().min(20),
  evidence_quote: z.string().min(10),
});
export type SubScoreOutput = z.infer<typeof SubScoreOutputSchema>;

export const DimensionScoreOutputSchema = z.object({
  sub_scores: z.array(SubScoreOutputSchema).min(1),
});
export type DimensionScoreOutput = z.infer<typeof DimensionScoreOutputSchema>;

export const ScoreOutputSchema = z.object({
  dimensions: z.object({
    impact: DimensionScoreOutputSchema,
    feasibility: DimensionScoreOutputSchema,
    cost: DimensionScoreOutputSchema,
  }),
});
export type ScoreOutput = z.infer<typeof ScoreOutputSchema>;

/* ---------- Executive brief (AI output shape) ---------- */

/**
 * BriefSectionsSchema — the three prose blocks the model writes.
 *
 * Each field is plain text (NOT Markdown). We stitch the Markdown skeleton
 * (headings, metadata header) in TypeScript so the layout is fixed and the
 * LLM can't reorder or rename sections. Per-field word budgets live in the
 * Zod description and are surfaced to the model via generateObject.
 */
export const BriefSectionsSchema = z.object({
  problem: z
    .string()
    .min(40)
    .describe(
      "The Problem — ~80 words. Name the bottleneck, who feels it, and weave in one short verbatim transcript snippet inside the prose. No solution language.",
    ),
  solution: z
    .string()
    .min(40)
    .describe(
      "The Solution — ~80 words. Describe the AI capability in plain English (no model names or API jargon) and how the user's day changes.",
    ),
  feasibility_and_effort: z
    .string()
    .min(40)
    .describe(
      "Feasibility & Effort — ~80 words. What's already in place, the riskiest dependency, rough size of build. Honest, not optimistic.",
    ),
});
export type BriefSectionsOutput = z.infer<typeof BriefSectionsSchema>;

/* ---------- Session-level executive brief (AI output shape) ---------- */

/**
 * SessionBriefSectionsSchema — one synthesised brief per discovery session.
 *
 * Synthesises across the top-ranked opportunities for a session into a
 * single executive narrative. The model emits structured prose only;
 * headings, scores, and the markdown skeleton are stitched in TypeScript
 * so layout cannot drift between calls. The `top_opportunities` array is
 * ordered to match the input opportunities (highest composite first); we
 * validate length and re-stitch by index after the call.
 */
export const SessionBriefSectionsSchema = z.object({
  executive_summary: z
    .string()
    .min(80)
    .describe(
      "~110 words. What process this session covered, where the team is bleeding time or value today, and the headline shift AI could deliver. Weave in ONE short verbatim transcript snippet inside quotation marks. No bullet lists. No recommended next steps here — that section comes later.",
    ),
  top_opportunities: z
    .array(
      z.object({
        headline: z
          .string()
          .min(10)
          .describe(
            "~12 words, action-oriented. Re-state the opportunity in a way that differentiates it from the others in this brief — do not echo the problem statement verbatim.",
          ),
        why_it_matters: z
          .string()
          .min(40)
          .describe(
            "~55 words. Why this is one of the biggest levers, in this session's specific terms. Reference concrete numbers, teams, or named systems from the transcript. Do not restate the problem the executive summary already covered — add the angle a VP needs to size this opportunity against the others.",
          ),
      }),
    )
    .min(1)
    .max(3),
  recommended_next_step: z
    .string()
    .min(40)
    .describe(
      "~45 words. The single concrete next move, written so a CX Director could act on it this week. Name which opportunity to pursue first and why, and what 'validated' looks like (a number, a user, a deliverable). Not a list of options.",
    ),
});
export type SessionBriefSectionsOutput = z.infer<
  typeof SessionBriefSectionsSchema
>;
