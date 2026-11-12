import { createThread } from "@convex-dev/agent";
import { v } from "convex/values";

import { components } from "./_generated/api";
import { env, internalAction, type ActionCtx } from "./_generated/server";
import { openRouterModel, rulingsAgent, type RulingsAgent } from "./agent/agent";

export type Answer = { threadId: string; text: string };

export const ask = internalAction({
  args: { question: v.string(), threadId: v.optional(v.string()) },
  handler: (ctx, args): Promise<Answer> =>
    answer(ctx, rulingsAgent(openRouterModel(env.OPENROUTER_API_KEY)), args),
});

export async function answer(
  ctx: ActionCtx,
  agent: RulingsAgent,
  { question, threadId }: { question: string; threadId?: string },
): Promise<Answer> {
  const thread = threadId ?? (await createThread(ctx, components.agent));
  const result = await agent.generateText(ctx, { threadId: thread }, { prompt: question });
  return { threadId: thread, text: result.text };
}
