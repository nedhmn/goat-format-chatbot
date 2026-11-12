import type { LanguageModelV4 } from "@ai-sdk/provider";
import { Agent, isStepCount } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { components } from "../_generated/api";
import { instructions } from "./instructions";
import { tools } from "./tools";

export const MODEL = "deepseek/deepseek-v4.1-flash-1017";

export type RulingsAgent = ReturnType<typeof rulingsAgent>;

export function rulingsAgent(languageModel: LanguageModelV4) {
  return new Agent(components.agent, {
    name: "rulings",
    languageModel,
    instructions,
    tools,
    stopWhen: isStepCount(8),
  });
}

export function openRouterModel(apiKey: string | undefined): LanguageModelV4 {
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Copy packages/backend/.env.example to .env, add the key, and restart pnpm dev.",
    );
  }
  return createOpenRouter({ apiKey }).chat(MODEL);
}
