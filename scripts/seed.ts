import { promises as fs } from "node:fs";
import path from "node:path";
import { saveSession, getSession } from "../lib/storage/sessions";
import { seedIdFromFilename } from "../lib/id";
import type { DiscoverySession } from "../lib/types";

const SEED_DIR = path.join(process.cwd(), "data", "seed");

/**
 * Extract a title from the first H1 in the markdown, or fall back to the
 * filename stem.
 */
function deriveTitle(markdown: string, filename: string): string {
  const h1 = markdown.match(/^#\s+(.+)$/m);
  if (h1) {
    return h1[1].trim();
  }
  return filename.replace(/\.md$/, "").replace(/^\d+-/, "").replace(/-/g, " ");
}

/**
 * Split a seed markdown file into the transcript body and the supplemental
 * context block (everything after the `## Supplemental context` heading).
 * The body keeps its own headings; the context is returned as plain text.
 */
function splitTranscriptAndContext(markdown: string): {
  body: string;
  context: string | undefined;
} {
  const marker = /^##\s+Supplemental context\s*$/m;
  const match = markdown.match(marker);
  if (!match || match.index === undefined) {
    return { body: markdown.trim(), context: undefined };
  }
  const body = markdown.slice(0, match.index).trim();
  const context = markdown.slice(match.index + match[0].length).trim();
  return { body, context: context.length > 0 ? context : undefined };
}

async function seedOne(filename: string): Promise<"created" | "skipped"> {
  const id = seedIdFromFilename(filename);
  const existing = await getSession(id);
  if (existing) return "skipped";

  const fullPath = path.join(SEED_DIR, filename);
  const markdown = await fs.readFile(fullPath, "utf8");
  const { body, context } = splitTranscriptAndContext(markdown);

  const session: DiscoverySession = {
    id,
    title: deriveTitle(markdown, filename),
    source: "seed",
    ingested_at: new Date().toISOString(),
    raw_text: body,
    supplemental_context: context,
  };
  await saveSession(session);
  return "created";
}

async function main(): Promise<void> {
  const entries = await fs.readdir(SEED_DIR);
  const mdFiles = entries.filter((f) => f.endsWith(".md")).sort();

  if (mdFiles.length === 0) {
    console.log("No seed files found in data/seed/. Nothing to do.");
    return;
  }

  let created = 0;
  let skipped = 0;
  for (const file of mdFiles) {
    const result = await seedOne(file);
    if (result === "created") created += 1;
    else skipped += 1;
    console.log(`  ${result.padEnd(8)}  ${file}`);
  }

  console.log(`\nSeed complete. Created ${created}, skipped ${skipped}.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
