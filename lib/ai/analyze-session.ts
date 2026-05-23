import { generateObject } from "ai";
import { MODEL } from "./client";
import {
  BottleneckListSchema,
  ClarifyingQuestionsSchema,
  WorkflowMapSchema,
  type BottleneckListOutput,
  type ClarifyingQuestionsOutput,
  type WorkflowMapOutput,
} from "./schemas";
import {
  BOTTLENECKS_PROMPT_V1,
  CLARIFYING_PROMPT_V1,
  WORKFLOW_PROMPT_V1,
} from "./prompts";

export type AnalyzeSessionResult = {
  workflow: WorkflowMapOutput;
  bottlenecks: BottleneckListOutput;
  clarifying: ClarifyingQuestionsOutput;
};

function buildUserMessage(rawText: string, supplementalContext?: string) {
  if (!supplementalContext) {
    return `Transcript:\n\n${rawText}`;
  }
  return `Transcript:\n\n${rawText}\n\nSupplemental context:\n\n${supplementalContext}`;
}

export async function analyzeSession(
  rawText: string,
  supplementalContext?: string,
): Promise<AnalyzeSessionResult> {
  const userMessage = buildUserMessage(rawText, supplementalContext);

  const workflow = await generateObject({
    model: MODEL,
    schema: WorkflowMapSchema,
    system: WORKFLOW_PROMPT_V1,
    prompt: userMessage,
  });

  const bottlenecks = await generateObject({
    model: MODEL,
    schema: BottleneckListSchema,
    system: BOTTLENECKS_PROMPT_V1,
    prompt: userMessage,
  });

  const clarifying = await generateObject({
    model: MODEL,
    schema: ClarifyingQuestionsSchema,
    system: CLARIFYING_PROMPT_V1,
    prompt: userMessage,
  });

  return {
    workflow: workflow.object,
    bottlenecks: bottlenecks.object,
    clarifying: clarifying.object,
  };
}
