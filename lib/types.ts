import { z } from "zod";

/* ---------- Discovery sessions ---------- */

export const DiscoverySessionSourceSchema = z.enum(["paste", "upload", "seed"]);
export type DiscoverySessionSource = z.infer<typeof DiscoverySessionSourceSchema>;

export const WorkflowStageSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  actors: z.array(z.string().min(1)),
});
export type WorkflowStage = z.infer<typeof WorkflowStageSchema>;

export const WorkflowMapSchema = z.object({
  stages: z.array(WorkflowStageSchema),
});
export type WorkflowMap = z.infer<typeof WorkflowMapSchema>;

export const BottleneckSchema = z.object({
  id: z.string().min(1),
  stage: z.string().min(1),
  description: z.string().min(1),
  evidence_quote: z.string().min(10),
  ai_solvable: z.boolean(),
  ai_solvable_reasoning: z.string().min(1),
});
export type Bottleneck = z.infer<typeof BottleneckSchema>;

// Tagged union so future-us can branch on `status` exhaustively in the UI.
export const ClarifyingQuestionSchema = z.discriminatedUnion("status", [
  z.object({
    id: z.string().min(1),
    status: z.literal("open"),
    question: z.string().min(1),
    why_needed: z.string().min(1),
  }),
  z.object({
    id: z.string().min(1),
    status: z.literal("answered"),
    question: z.string().min(1),
    why_needed: z.string().min(1),
    answer: z.string().min(1),
  }),
]);
export type ClarifyingQuestion = z.infer<typeof ClarifyingQuestionSchema>;

export const DiscoverySessionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  source: DiscoverySessionSourceSchema,
  ingested_at: z.string().min(1),
  raw_text: z.string().min(1),
  supplemental_context: z.string().optional(),
  workflow: WorkflowMapSchema.optional(),
  bottlenecks: z.array(BottleneckSchema).optional(),
  clarifying_questions: z.array(ClarifyingQuestionSchema).optional(),
});
export type DiscoverySession = z.infer<typeof DiscoverySessionSchema>;

/* ---------- Scoring ---------- */

export const SubScoreSchema = z.object({
  name: z.string().min(1),
  score: z.number().int().min(1).max(5),
  rationale: z.string().min(20),
  evidence_quote: z.string().min(10),
});
export type SubScore = z.infer<typeof SubScoreSchema>;

export const DimensionScoreSchema = z.object({
  dimension_score: z.number().min(1).max(5),
  sub_scores: z.array(SubScoreSchema).min(1),
});
export type DimensionScore = z.infer<typeof DimensionScoreSchema>;

export const ScoreSchema = z.object({
  rubric_version: z.string().min(1),
  dimensions: z.object({
    impact: DimensionScoreSchema,
    feasibility: DimensionScoreSchema,
    cost: DimensionScoreSchema,
  }),
  composite: z.number().min(1).max(5),
});
export type Score = z.infer<typeof ScoreSchema>;

/* ---------- Opportunities ---------- */

export const OpportunitySchema = z.object({
  id: z.string().min(1),
  session_id: z.string().min(1),
  bottleneck_id: z.string().min(1),
  problem_statement: z.string().min(1),
  ai_solution_concept: z.string().min(1),
  score: ScoreSchema.optional(),
  brief_path: z.string().optional(),
  created_at: z.string().min(1),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;
