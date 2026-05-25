import { tryReadText, writeText } from "./fs";

const SESSION_BRIEFS_PREFIX = "session-briefs";

function sessionBriefKey(sessionId: string): string {
  return `${SESSION_BRIEFS_PREFIX}/${sessionId}.md`;
}

export async function readSessionBrief(
  sessionId: string,
): Promise<string | null> {
  return tryReadText(sessionBriefKey(sessionId));
}

export async function writeSessionBrief(
  sessionId: string,
  markdown: string,
): Promise<void> {
  await writeText(sessionBriefKey(sessionId), markdown, "text/markdown");
}
