import { listJson, tryReadJson, writeJson } from "./fs";
import { DiscoverySessionSchema, type DiscoverySession } from "@/lib/types";

const SESSIONS_PREFIX = "sessions";

function sessionKey(id: string): string {
  return `${SESSIONS_PREFIX}/${id}.json`;
}

export async function saveSession(session: DiscoverySession): Promise<void> {
  const parsed = DiscoverySessionSchema.parse(session);
  await writeJson(sessionKey(parsed.id), parsed);
}

export async function getSession(
  id: string,
): Promise<DiscoverySession | null> {
  return tryReadJson(sessionKey(id), DiscoverySessionSchema);
}

export async function listSessions(): Promise<DiscoverySession[]> {
  return listJson(SESSIONS_PREFIX, DiscoverySessionSchema);
}
