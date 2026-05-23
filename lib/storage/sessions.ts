import path from "node:path";
import { DATA_ROOT, listJson, tryReadJson, writeJson } from "./fs";
import { DiscoverySessionSchema, type DiscoverySession } from "@/lib/types";

const SESSIONS_DIR = path.join(DATA_ROOT, "sessions");

function sessionPath(id: string): string {
  return path.join(SESSIONS_DIR, `${id}.json`);
}

export async function saveSession(session: DiscoverySession): Promise<void> {
  const parsed = DiscoverySessionSchema.parse(session);
  await writeJson(sessionPath(parsed.id), parsed);
}

export async function getSession(
  id: string,
): Promise<DiscoverySession | null> {
  return tryReadJson(sessionPath(id), DiscoverySessionSchema);
}

export async function listSessions(): Promise<DiscoverySession[]> {
  return listJson(SESSIONS_DIR, DiscoverySessionSchema);
}
