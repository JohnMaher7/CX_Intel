import { randomUUID } from "node:crypto";

export function newId(): string {
  return randomUUID();
}

/**
 * Stable id derived from a filename — used for seeded records so re-running
 * the seed script does not create duplicate sessions on disk.
 */
export function seedIdFromFilename(filename: string): string {
  return `seed-${filename.replace(/\.md$/, "")}`;
}
