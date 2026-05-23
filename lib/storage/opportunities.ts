import path from "node:path";
import { DATA_ROOT, listJson, tryReadJson, writeJson } from "./fs";
import { OpportunitySchema, type Opportunity } from "@/lib/types";

const OPPORTUNITIES_DIR = path.join(DATA_ROOT, "opportunities");

function opportunityPath(id: string): string {
  return path.join(OPPORTUNITIES_DIR, `${id}.json`);
}

export async function saveOpportunity(opp: Opportunity): Promise<void> {
  const parsed = OpportunitySchema.parse(opp);
  await writeJson(opportunityPath(parsed.id), parsed);
}

export async function getOpportunity(
  id: string,
): Promise<Opportunity | null> {
  return tryReadJson(opportunityPath(id), OpportunitySchema);
}

export async function listOpportunities(): Promise<Opportunity[]> {
  return listJson(OPPORTUNITIES_DIR, OpportunitySchema);
}
