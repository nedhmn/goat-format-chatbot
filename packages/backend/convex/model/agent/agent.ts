import type { LanguageModelV4 } from "@ai-sdk/provider";
import { Agent, isStepCount } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { ModelMessage } from "ai";

import { components } from "../../_generated/api";
import { instructions } from "./instructions";
import { tools } from "./tools";

export const MODEL = "deepseek/deepseek-v4.1-flash-1017";

export const MAX_STEPS = 8;

export const ANSWER_NOW =
  "You have no tool calls left. Answer now from the passages you already have, in the format your instructions give. If they do not settle the question, say that the rulings data does not cover it.";

export function lastStepAnswers({
  stepNumber,
  messages,
}: {
  stepNumber: number;
  messages: ModelMessage[];
}) {
  if (stepNumber < MAX_STEPS - 1) return {};
  return {
    activeTools: [],
    messages: [...messages, { role: "user" as const, content: ANSWER_NOW }],
  };
}

export type RulingsAgent = ReturnType<typeof rulingsAgent>;

export function rulingsAgent(languageModel: LanguageModelV4) {
  return new Agent(components.agent, {
    name: "rulings",
    languageModel,
    instructions,
    tools,
    stopWhen: isStepCount(MAX_STEPS),
  });
}

export const MISSING_KEY =
  "OPENROUTER_API_KEY is not set. Copy packages/backend/.env.example to .env, add the key, and restart pnpm dev.";

export function openRouterModel(apiKey: string | undefined): LanguageModelV4 {
  if (!apiKey) throw new Error(MISSING_KEY);
  return createOpenRouter({ apiKey }).chat(MODEL);
}
