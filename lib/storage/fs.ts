import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { ZodType } from "zod";

export const DATA_ROOT = path.join(process.cwd(), "data");

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Atomic write: serialise to a sibling tempfile, then rename onto the target.
 * Rename is atomic on POSIX; on Windows-mounted filesystems it may fail with
 * EACCES under contention, in which case we fall back to a direct write.
 */
export async function writeJson<T>(filePath: string, value: T): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const data = JSON.stringify(value, null, 2);
  const tmp = `${filePath}.${randomBytes(4).toString("hex")}.tmp`;
  try {
    await fs.writeFile(tmp, data, "utf8");
    await fs.rename(tmp, filePath);
  } catch {
    await fs.writeFile(filePath, data, "utf8");
    await fs.rm(tmp, { force: true });
  }
}

export async function readJson<T>(
  filePath: string,
  schema: ZodType<T>,
): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return schema.parse(parsed);
}

export async function tryReadJson<T>(
  filePath: string,
  schema: ZodType<T>,
): Promise<T | null> {
  try {
    return await readJson(filePath, schema);
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

export async function listJson<T>(
  dir: string,
  schema: ZodType<T>,
): Promise<T[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      return [];
    }
    throw err;
  }
  const jsonFiles = entries.filter((f) => f.endsWith(".json"));
  return Promise.all(
    jsonFiles.map((f) => readJson(path.join(dir, f), schema)),
  );
}
