import {
  createThread,
  getThreadMetadata,
  listUIMessages,
  saveMessage,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { components, internal } from "./_generated/api";
import {
  env,
  internalAction,
  mutation,
  query,
  type ActionCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  lastStepAnswers,
  MISSING_KEY,
  openRouterModel,
  rulingsAgent,
  type RulingsAgent,
} from "./agent/agent";

export type Answer = { threadId: string; text: string };

export type Sent = { threadId: string };

export const STREAM_THROTTLE_MS = 100;

export const NOT_YOUR_THREAD = "This thread belongs to someone else.";

export const send = mutation({
  args: { question: v.string(), threadId: v.optional(v.string()) },
  handler: async (ctx, { question, threadId }): Promise<Sent> => {
    if (!env.OPENROUTER_API_KEY) throw new ConvexError(MISSING_KEY);
    const userId = await viewer(ctx);
    const thread =
      threadId === undefined
        ? await createThread(ctx, components.agent, { userId })
        : await ownThread(ctx, threadId);
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: thread,
      userId,
      prompt: question,
    });
    await ctx.scheduler.runAfter(0, internal.chat.reply, {
      threadId: thread,
      promptMessageId: messageId,
    });
    return { threadId: thread };
  },
});

export const reply = internalAction({
  args: { threadId: v.string(), promptMessageId: v.string() },
  handler: (ctx, args): Promise<void> =>
    streamReply(ctx, rulingsAgent(openRouterModel(env.OPENROUTER_API_KEY)), args),
});

export const messages = query({
  args: { threadId: v.string(), paginationOpts: paginationOptsValidator, streamArgs: vStreamArgs },
  handler: async (ctx, { threadId, paginationOpts, streamArgs }) => {
    await ownThread(ctx, threadId);
    const paginated = await listUIMessages(ctx, components.agent, { threadId, paginationOpts });
    const streams = await syncStreams(ctx, components.agent, { threadId, streamArgs });
    return { ...paginated, streams };
  },
});

export const ask = internalAction({
  args: { question: v.string(), threadId: v.optional(v.string()) },
  handler: (ctx, args): Promise<Answer> =>
    answer(ctx, rulingsAgent(openRouterModel(env.OPENROUTER_API_KEY)), args),
});

export async function streamReply(
  ctx: ActionCtx,
  agent: RulingsAgent,
  { threadId, promptMessageId }: { threadId: string; promptMessageId: string },
  throttleMs = STREAM_THROTTLE_MS,
): Promise<void> {
  const result = await agent.streamText(
    ctx,
    { threadId },
    { promptMessageId, prepareStep: lastStepAnswers },
    { saveStreamDeltas: { chunking: "word", throttleMs } },
  );
  await result.consumeStream();
}

export async function answer(
  ctx: ActionCtx,
  agent: RulingsAgent,
  { question, threadId }: { question: string; threadId?: string },
): Promise<Answer> {
  const thread = threadId ?? (await createThread(ctx, components.agent));
  const result = await agent.generateText(
    ctx,
    { threadId: thread },
    { prompt: question, prepareStep: lastStepAnswers },
  );
  return { threadId: thread, text: result.text };
}

async function viewer(_ctx: QueryCtx): Promise<string | undefined> {
  return undefined;
}

async function ownThread(ctx: QueryCtx, threadId: string): Promise<string> {
  const thread = await getThreadMetadata(ctx, components.agent, { threadId });
  if ((thread.userId ?? undefined) !== (await viewer(ctx))) {
    throw new ConvexError(NOT_YOUR_THREAD);
  }
  return threadId;
}
