import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";
// NOTE: analyzeSession is imported dynamically inside main() AFTER env load.

/**
 * Load .env.local into process.env BEFORE we dynamically import
 * lib/ai/* — client.ts reads ANTHROPIC_API_KEY at module init and throws
 * if it is missing, so static imports would race with env loading.
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
    console.error("Usage: pnpm tsx scripts/analyze.ts <path-to-markdown>");
    process.exit(1);
  }

  const absolutePath = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(process.cwd(), inputPath);

  const rawText = await fs.readFile(absolutePath, "utf8");

  console.error(`Analyzing ${absolutePath} (${rawText.length} chars)...`);
  console.error("");

  const { analyzeSession } = await import("../lib/ai/analyze-session");
  const result = await analyzeSession(rawText);

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("analyze failed:", err);
  process.exit(1);
});
