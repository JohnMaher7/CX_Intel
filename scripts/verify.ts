import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * verify.ts — end-to-end smoke check the demo relies on.
 *
 * What this asserts (and why each assertion exists):
 *  1. Determinism — scoring the same opportunity three times produces an
 *     identical composite. This is the load-bearing claim of the rubric:
 *     "scores are reproducible". If it ever breaks, the demo narrative
 *     breaks too.
 *  2. Evidence grounding — at least one sub-score's `evidence_quote`
 *     appears verbatim in the source transcript. This is what stops
 *     scores from being vibes; if the model is paraphrasing, the demo
 *     should fail before the interview, not during it.
 *  3. Data integrity — every opportunity on disk has a numeric composite.
 *     A missing composite means the dashboard would silently hide that
 *     row, which is exactly the kind of thing you discover live.
 *
 * Run with: pnpm verify
 *
 * See notes/verification-scripts.md.
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

type CheckResult = { name: string; ok: boolean; detail: string };

function pass(name: string, detail: string): CheckResult {
  return { name, ok: true, detail };
}

function fail(name: string, detail: string): CheckResult {
  return { name, ok: false, detail };
}

/**
 * Normalise whitespace for substring comparison. Models sometimes emit a
 * quote with collapsed newlines or trimmed leading whitespace; we want the
 * check to be honest about content, not formatting.
 */
function normalise(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

async function main(): Promise<void> {
  loadEnvLocal();

  const { listOpportunities } = await import("../lib/storage/opportunities");
  const { getSession } = await import("../lib/storage/sessions");
  const { scoreOpportunity } = await import("../lib/ai/score-opportunity");

  const results: CheckResult[] = [];
  const opps = await listOpportunities();

  // --- Check 3: every persisted opportunity has a composite ---
  const missing = opps.filter((o) => !o.score || typeof o.score.composite !== "number");
  if (opps.length === 0) {
    results.push(
      fail(
        "opportunities exist",
        "No opportunities on disk. Run `pnpm seed` then ingest at least one session before running verify.",
      ),
    );
  } else if (missing.length > 0) {
    results.push(
      fail(
        "every opportunity has a composite",
        `${missing.length}/${opps.length} opportunities are missing score.composite. Offenders: ${missing
          .map((o) => o.id)
          .join(", ")}`,
      ),
    );
  } else {
    results.push(
      pass(
        "every opportunity has a composite",
        `${opps.length} opportunities, all scored.`,
      ),
    );
  }

  // Pick the first scored opportunity to drive checks 1 + 2.
  const target = opps.find((o) => o.score);
  if (!target) {
    results.push(
      fail(
        "determinism check",
        "Cannot run determinism check — no scored opportunity available.",
      ),
    );
    report(results);
    process.exit(1);
  }

  const session = await getSession(target.session_id);
  if (!session) {
    results.push(
      fail(
        "determinism check",
        `Opportunity ${target.id} references session ${target.session_id} which is not on disk.`,
      ),
    );
    report(results);
    process.exit(1);
  }

  console.error(
    `Scoring opportunity ${target.id} three times against session "${session.title}"...`,
  );

  // --- Check 1: determinism (3x same composite) ---
  const composites: number[] = [];
  let firstRunScore: Awaited<ReturnType<typeof scoreOpportunity>> | null = null;
  for (let i = 1; i <= 3; i++) {
    console.error(`  run ${i}/3...`);
    const score = await scoreOpportunity(target, session.raw_text);
    composites.push(score.composite);
    if (i === 1) firstRunScore = score;
  }

  const allEqual = composites.every((c) => c === composites[0]);
  if (allEqual) {
    results.push(
      pass("scoring is deterministic", `3× composite = ${composites[0].toFixed(4)}`),
    );
  } else {
    results.push(
      fail(
        "scoring is deterministic",
        `3× scoring produced different composites: ${composites
          .map((c) => c.toFixed(4))
          .join(", ")}. Investigate temperature / schema / prompt drift.`,
      ),
    );
  }

  // --- Check 2: at least one evidence_quote is a verbatim substring ---
  if (!firstRunScore) {
    results.push(fail("evidence grounding", "No score available to inspect."));
  } else {
    const haystack = normalise(session.raw_text);
    const subScores = (
      ["impact", "feasibility", "cost"] as const
    ).flatMap((d) => firstRunScore!.dimensions[d].sub_scores);

    const hit = subScores.find((s) =>
      haystack.includes(normalise(s.evidence_quote)),
    );

    if (hit) {
      results.push(
        pass(
          "evidence_quote is verbatim from source",
          `${hit.name} → "${hit.evidence_quote.slice(0, 80)}${hit.evidence_quote.length > 80 ? "…" : ""}"`,
        ),
      );
    } else {
      results.push(
        fail(
          "evidence_quote is verbatim from source",
          `None of ${subScores.length} sub-score evidence_quotes appear verbatim in the transcript. The model is paraphrasing — tighten the scoring prompt.`,
        ),
      );
    }
  }

  report(results);
  const failed = results.filter((r) => !r.ok);
  process.exit(failed.length > 0 ? 1 : 0);
}

function report(results: CheckResult[]): void {
  console.error("");
  console.error("=== verify.ts results ===");
  for (const r of results) {
    const mark = r.ok ? "PASS" : "FAIL";
    console.error(`  [${mark}] ${r.name}`);
    console.error(`         ${r.detail}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.error("");
  if (failed === 0) {
    console.error(`All ${results.length} checks passed.`);
  } else {
    console.error(`${failed}/${results.length} check(s) FAILED.`);
  }
}

main().catch((err) => {
  console.error("verify failed:", err);
  process.exit(1);
});
