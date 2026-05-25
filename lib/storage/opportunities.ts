import { listJson, tryReadJson, writeJson } from "./fs";
import { OpportunitySchema, type Opportunity } from "@/lib/types";

const OPPORTUNITIES_PREFIX = "opportunities";

function opportunityKey(id: string): string {
  return `${OPPORTUNITIES_PREFIX}/${id}.json`;
}

export async function saveOpportunity(opp: Opportunity): Promise<void> {
  const parsed = OpportunitySchema.parse(opp);
  await writeJson(opportunityKey(parsed.id), parsed);
}

export async function getOpportunity(
  id: string,
): Promise<Opportunity | null> {
  return tryReadJson(opportunityKey(id), OpportunitySchema);
}

export async function listOpportunities(): Promise<Opportunity[]> {
  return listJson(OPPORTUNITIES_PREFIX, OpportunitySchema);
}
