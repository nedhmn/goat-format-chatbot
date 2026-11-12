import { v } from "convex/values";

import { env, internalAction } from "./_generated/server";
import { openRouterModel, rulingsAgent } from "./model/agent/agent";
import { answer, streamReply, type Answer } from "./model/agent/answer";

export const reply = internalAction({
  args: { threadId: v.string(), promptMessageId: v.string() },
  handler: (ctx, args): Promise<void> =>
    streamReply(ctx, rulingsAgent(openRouterModel(env.OPENROUTER_API_KEY)), args),
});

export const ask = internalAction({
  args: { question: v.string(), threadId: v.optional(v.string()) },
  handler: (ctx, args): Promise<Answer> =>
    answer(ctx, rulingsAgent(openRouterModel(env.OPENROUTER_API_KEY)), args),
});
