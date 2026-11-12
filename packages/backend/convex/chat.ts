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
import { questionAllowed, tooManyQuestions } from "./limits";

export type Answer = { threadId: string; text: string };

export type Sent = { threadId: string };

export type ThreadSummary = { threadId: string; title: string; createdAt: number };

export const STREAM_THROTTLE_MS = 100;

export const OWNER = "owner";

export const THREADS_LISTED = 50;

export const TITLE_LENGTH = 80;

export const UNTITLED = "Untitled question";

export const NOT_YOUR_THREAD = "This thread belongs to someone else.";

export const send = mutation({
  args: { question: v.string(), threadId: v.optional(v.string()) },
  handler: async (ctx, { question, threadId }): Promise<Sent> => {
    if (!env.OPENROUTER_API_KEY) throw new ConvexError(MISSING_KEY);
    const userId = await viewer(ctx);
    const allowed = await questionAllowed(ctx, userId);
    if (!allowed.ok) throw new ConvexError(tooManyQuestions(allowed.retryAfter));
    const thread =
      threadId === undefined
        ? await createThread(ctx, components.agent, { userId, title: threadTitle(question) })
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

export const threads = query({
  args: {},
  handler: async (ctx): Promise<ThreadSummary[]> => {
    const { page } = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
      userId: await viewer(ctx),
      order: "desc",
      paginationOpts: { cursor: null, numItems: THREADS_LISTED },
    });
    return page.map((thread) => ({
      threadId: thread._id,
      title: thread.title || UNTITLED,
      createdAt: thread._creationTime,
    }));
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

export function threadTitle(question: string): string {
  const title = question.replace(/\s+/g, " ").trim();
  return title.length > TITLE_LENGTH ? `${title.slice(0, TITLE_LENGTH - 1).trimEnd()}…` : title;
}

async function viewer(_ctx: QueryCtx): Promise<string> {
  return OWNER;
}

async function ownThread(ctx: QueryCtx, threadId: string): Promise<string> {
  const thread = await getThreadMetadata(ctx, components.agent, { threadId });
  if ((thread.userId ?? undefined) !== (await viewer(ctx))) {
    throw new ConvexError(NOT_YOUR_THREAD);
  }
  return threadId;
}
