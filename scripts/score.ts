import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Load .env.local into process.env BEFORE we dynamically import lib/ai/* —
 * client.ts reads ANTHROPIC_API_KEY at module init and throws if missing.
 */
function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  let raw: string;
  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: pnpm tsx scripts/score.ts <path-to-session-json>");
    process.exit(1);
  }

  const absolutePath = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(process.cwd(), inputPath);

  const raw = await fs.readFile(absolutePath, "utf8");
  const session = JSON.parse(raw) as {
    title: string;
    raw_text: string;
    supplemental_context?: string;
  };

  console.error(
    `Analyzing session "${session.title}" (${session.raw_text.length} chars)...`,
  );

  const { analyzeSession } = await import("../lib/ai/analyze-session");
  const { scoreOpportunity } = await import("../lib/ai/score-opportunity");

  const analysis = await analyzeSession(
    session.raw_text,
    session.supplemental_context,
  );

  const target = analysis.bottlenecks.bottlenecks.find((b) => b.ai_solvable);
  if (!target) {
    console.error(
      "No ai_solvable bottleneck found in this session. Cannot score.",
    );
    process.exit(1);
  }

  console.error("");
  console.error(`Target bottleneck (stage: ${target.stage})`);
  console.error(`  description: ${target.description}`);
  console.error(`  evidence:    "${target.evidence_quote}"`);
  console.error("");

  const opportunityShell = {
    problem_statement: `In the "${target.stage}" stage of this workflow, ${target.description}`,
    ai_solution_concept: `Apply an LLM-powered solution: ${target.ai_solvable_reasoning}`,
  };

  console.error("Scoring 3 times for determinism check...");
  const runs = [];
  for (let i = 1; i <= 3; i++) {
    console.error(`  run ${i}...`);
    const score = await scoreOpportunity(opportunityShell, session.raw_text);
    runs.push(score);
  }

  console.error("");
  console.error("=== Composite scores ===");
  for (let i = 0; i < runs.length; i++) {
    console.error(`  run ${i + 1}: ${runs[i].composite.toFixed(4)}`);
  }

  console.error("");
  console.error("=== Run 1 evidence quotes (per sub-score) ===");
  for (const dimName of ["impact", "feasibility", "cost"] as const) {
    const dim = runs[0].dimensions[dimName];
    console.error(
      `  ${dimName} (dim score ${dim.dimension_score.toFixed(2)}):`,
    );
    for (const sub of dim.sub_scores) {
      console.error(`    - ${sub.name} = ${sub.score}`);
      console.error(`        quote:     "${sub.evidence_quote}"`);
      console.error(`        rationale: ${sub.rationale}`);
    }
  }

  console.log(JSON.stringify(runs[0], null, 2));

  const composites = runs.map((r) => r.composite);
  const allEqual = composites.every((c) => c === composites[0]);
  if (!allEqual) {
    console.error("");
    console.error(
      `DETERMINISM CHECK FAILED. Composites: ${composites.join(", ")}`,
    );
    process.exit(2);
  }

  console.error("");
  console.error("DETERMINISM CHECK PASSED. All three composites identical.");
}

main().catch((err) => {
  console.error("score failed:", err);
  process.exit(1);
});
