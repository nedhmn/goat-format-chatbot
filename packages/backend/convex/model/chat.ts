import {
  createThread,
  getThreadMetadata,
  listUIMessages,
  saveMessage,
  syncStreams,
  type StreamArgs,
} from "@convex-dev/agent";
import type { PaginationOptions } from "convex/server";
import { ConvexError } from "convex/values";

import { components, internal } from "../_generated/api";
import { env, type MutationCtx, type QueryCtx } from "../_generated/server";
import { MISSING_KEY } from "./agent/agent";
import { questionAllowed, tooManyQuestions } from "./limits";

export type Sent = { threadId: string };

export type ThreadSummary = { threadId: string; title: string; createdAt: number };

export const OWNER = "owner";

export const THREADS_LISTED = 50;

export const TITLE_LENGTH = 80;

export const UNTITLED = "Untitled question";

export const NOT_YOUR_THREAD = "This thread belongs to someone else.";

export async function sendQuestion(
  ctx: MutationCtx,
  { question, threadId }: { question: string; threadId?: string },
): Promise<Sent> {
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
  await ctx.scheduler.runAfter(0, internal.agent.reply, {
    threadId: thread,
    promptMessageId: messageId,
  });
  return { threadId: thread };
}

export async function threadMessages(
  ctx: QueryCtx,
  {
    threadId,
    paginationOpts,
    streamArgs,
  }: { threadId: string; paginationOpts: PaginationOptions; streamArgs?: StreamArgs },
) {
  await ownThread(ctx, threadId);
  const paginated = await listUIMessages(ctx, components.agent, { threadId, paginationOpts });
  const streams = await syncStreams(ctx, components.agent, { threadId, streamArgs });
  return { ...paginated, streams };
}

export async function viewerThreads(ctx: QueryCtx): Promise<ThreadSummary[]> {
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
