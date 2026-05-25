import { tryReadText, writeText } from "./fs";

const BRIEFS_PREFIX = "briefs";

function briefKey(opportunityId: string): string {
  return `${BRIEFS_PREFIX}/${opportunityId}.md`;
}

export async function readBrief(opportunityId: string): Promise<string | null> {
  return tryReadText(briefKey(opportunityId));
}

export async function writeBrief(
  opportunityId: string,
  markdown: string,
): Promise<void> {
  await writeText(briefKey(opportunityId), markdown, "text/markdown");
}
