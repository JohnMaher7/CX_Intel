import { createAnthropic } from "@ai-sdk/anthropic";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error(
    "ANTHROPIC_API_KEY is not set. Add it to .env.local before running the AI engine.",
  );
}

export const anthropic = createAnthropic({ apiKey });
export const MODEL = anthropic("claude-sonnet-4-6");
