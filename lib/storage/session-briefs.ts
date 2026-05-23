import { promises as fs } from "node:fs";
import path from "node:path";
import { DATA_ROOT } from "./fs";

const SESSION_BRIEFS_DIR = path.join(DATA_ROOT, "session-briefs");

export function getSessionBriefPath(sessionId: string): string {
  return path.join(SESSION_BRIEFS_DIR, `${sessionId}.md`);
}

export async function readSessionBrief(
  sessionId: string,
): Promise<string | null> {
  try {
    return await fs.readFile(getSessionBriefPath(sessionId), "utf8");
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      return null;
    }
    throw err;
  }
}

export async function writeSessionBrief(
  sessionId: string,
  markdown: string,
): Promise<void> {
  await fs.mkdir(SESSION_BRIEFS_DIR, { recursive: true });
  await fs.writeFile(getSessionBriefPath(sessionId), markdown, "utf8");
}
