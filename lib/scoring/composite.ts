import type { Score } from "../types";
import { RUBRIC_V1, type RubricV1 } from "./rubric";

/**
 * Compute the composite score from an already-populated Score.
 *
 * Pure function: same input → identical output every time. This is where
 * determinism lives, not in the LLM. The model returns sub-scores; we
 * aggregate them in TypeScript so the maths is auditable and version-able.
 *
 * Aggregation:
 *   dimension_score = mean(sub_scores[].score)   // simple unweighted mean
 *   composite       = Σ (weight_d * dimension_score_d)
 *
 * Weights live in the rubric. `cost` is already encoded so that 5 = cheapest,
 * meaning no inversion is needed here — all three dimensions point the same
 * direction (higher is better). See notes/weighted-composite-scoring.md.
 */
export function computeComposite(
  score: Score,
  rubric: RubricV1 = RUBRIC_V1,
): number {
  let total = 0;
  let totalWeight = 0;
  for (const name of Object.keys(rubric.dimensions) as Array<
    keyof typeof rubric.dimensions
  >) {
    const weight = rubric.dimensions[name].weight;
    total += weight * score.dimensions[name].dimension_score;
    totalWeight += weight;
  }
  // Defensive: if weights don't sum to 1.0 (rubric edit gone wrong),
  // normalise rather than silently scaling the composite out of [1,5].
  return total / totalWeight;
}

export function meanSubScores(subScores: ReadonlyArray<{ score: number }>): number {
  if (subScores.length === 0) {
    throw new Error("Cannot compute dimension score from zero sub-scores");
  }
  let sum = 0;
  for (const s of subScores) sum += s.score;
  return sum / subScores.length;
}
