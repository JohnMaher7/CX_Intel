import { promises as fs } from "node:fs";
import path from "node:path";
import { DATA_ROOT } from "./fs";

const BRIEFS_DIR = path.join(DATA_ROOT, "briefs");

export function getBriefPath(opportunityId: string): string {
  return path.join(BRIEFS_DIR, `${opportunityId}.md`);
}

/** Relative path from the project root — handy for storing on Opportunity records. */
export function getBriefRelativePath(opportunityId: string): string {
  return path.relative(process.cwd(), getBriefPath(opportunityId));
}

export async function readBrief(opportunityId: string): Promise<string | null> {
  try {
    return await fs.readFile(getBriefPath(opportunityId), "utf8");
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

export async function writeBrief(
  opportunityId: string,
  markdown: string,
): Promise<void> {
  await fs.mkdir(BRIEFS_DIR, { recursive: true });
  await fs.writeFile(getBriefPath(opportunityId), markdown, "utf8");
}
