import {
  createThread,
  getThreadMetadata,
  listMessages,
  listUIMessages,
  saveMessage,
  syncStreams,
  type StreamArgs,
} from "@convex-dev/agent";
import type { PaginationOptions, PaginationResult } from "convex/server";
import { ConvexError } from "convex/values";

import { components, internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { env, type MutationCtx, type QueryCtx } from "../_generated/server";
import { MISSING_KEY } from "./agent/agent";
import { questionAllowed, tooManyQuestions } from "./limits";

export type Sent = { threadId: string };

export type ThreadSummary = { threadId: string; title: string; activeAt: number };

export const OWNER = "owner";

export const THREADS_FOUND = 20;

export const BACKFILL_BATCH = 50;

export const TITLE_LENGTH = 80;

export const UNTITLED = "Untitled question";

export const NOT_YOUR_THREAD = "This thread belongs to someone else.";

export const NO_THREAD = "This thread no longer exists.";

export const EMPTY_TITLE = "A title needs at least one character.";

export const PINS_LISTED = 50;

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
      ? await startThread(ctx, userId, question)
      : await ownThread(ctx, threadId);
  const { messageId } = await saveMessage(ctx, components.agent, {
    threadId: thread.threadId,
    userId,
    prompt: question,
  });
  await touchThread(ctx, { ...thread, userId, activeAt: Date.now() });
  await ctx.scheduler.runAfter(0, internal.agent.reply, {
    threadId: thread.threadId,
    promptMessageId: messageId,
  });
  return { threadId: thread.threadId };
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

export async function viewerThreads(
  ctx: QueryCtx,
  paginationOpts: PaginationOptions,
): Promise<PaginationResult<ThreadSummary>> {
  const userId = await viewer(ctx);
  const listed = await ctx.db
    .query("threads")
    .withIndex("by_user_pinned_active", (q) => q.eq("userId", userId).eq("pinnedAt", undefined))
    .order("desc")
    .paginate(paginationOpts);
  return { ...listed, page: listed.page.map(toSummary) };
}

export async function searchViewerThreads(ctx: QueryCtx, query: string): Promise<ThreadSummary[]> {
  const words = query.trim();
  if (!words) return [];
  const userId = await viewer(ctx);
  const found = await ctx.db
    .query("threads")
    .withSearchIndex("search_title", (q) => q.search("title", words).eq("userId", userId))
    .take(THREADS_FOUND);
  return found.map(toSummary);
}

export async function viewerPins(ctx: QueryCtx): Promise<ThreadSummary[]> {
  const userId = await viewer(ctx);
  const pinned = await ctx.db
    .query("threads")
    .withIndex("by_user_pinned_active", (q) => q.eq("userId", userId).gt("pinnedAt", 0))
    .order("desc")
    .take(PINS_LISTED);
  return pinned.map(toSummary);
}

export async function pinThread(
  ctx: MutationCtx,
  { threadId, pinned }: { threadId: string; pinned: boolean },
): Promise<void> {
  const row = await ownRow(ctx, threadId);
  await ctx.db.patch(row._id, { pinnedAt: pinned ? Date.now() : undefined });
}

export async function renameThread(
  ctx: MutationCtx,
  { threadId, title }: { threadId: string; title: string },
): Promise<void> {
  const row = await ownRow(ctx, threadId);
  const renamed = threadTitle(title);
  if (!renamed) throw new ConvexError(EMPTY_TITLE);
  await ctx.db.patch(row._id, { title: renamed });
  await ctx.runMutation(components.agent.threads.updateThread, {
    threadId,
    patch: { title: renamed },
  });
}

export async function removeThread(ctx: MutationCtx, threadId: string): Promise<void> {
  const row = await ownRow(ctx, threadId);
  await ctx.db.delete(row._id);
  await ctx.runMutation(components.agent.threads.deleteAllForThreadIdAsync, { threadId });
}

export async function backfillThreads(ctx: MutationCtx, cursor: string | null): Promise<void> {
  const userId = await viewer(ctx);
  const listed = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
    userId,
    order: "desc",
    paginationOpts: { cursor, numItems: BACKFILL_BATCH },
  });
  for (const thread of listed.page) {
    const { page } = await listMessages(ctx, components.agent, {
      threadId: thread._id,
      paginationOpts: { cursor: null, numItems: 1 },
    });
    const activeAt = page[0]?._creationTime ?? thread._creationTime;
    await touchThread(ctx, {
      threadId: thread._id,
      title: thread.title || UNTITLED,
      userId,
      activeAt,
    });
  }
  if (!listed.isDone) {
    await ctx.scheduler.runAfter(0, internal.chat.backfillThreads, {
      cursor: listed.continueCursor,
    });
  }
}

export function threadTitle(question: string): string {
  const title = question.replace(/\s+/g, " ").trim();
  return title.length > TITLE_LENGTH ? `${title.slice(0, TITLE_LENGTH - 1).trimEnd()}…` : title;
}

async function viewer(_ctx: QueryCtx): Promise<string> {
  return OWNER;
}

type StartedThread = { threadId: string; title: string };

type ThreadActivity = StartedThread & { userId: string; activeAt: number };

async function startThread(
  ctx: MutationCtx,
  userId: string,
  question: string,
): Promise<StartedThread> {
  const title = threadTitle(question);
  const threadId = await createThread(ctx, components.agent, { userId, title });
  return { threadId, title };
}

async function ownThread(ctx: QueryCtx, threadId: string): Promise<StartedThread> {
  const thread = await getThreadMetadata(ctx, components.agent, { threadId });
  if ((thread.userId ?? undefined) !== (await viewer(ctx))) {
    throw new ConvexError(NOT_YOUR_THREAD);
  }
  return { threadId, title: thread.title || UNTITLED };
}

async function ownRow(ctx: QueryCtx, threadId: string): Promise<Doc<"threads">> {
  const row = await ctx.db
    .query("threads")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .unique();
  if (row === null) throw new ConvexError(NO_THREAD);
  if (row.userId !== (await viewer(ctx))) throw new ConvexError(NOT_YOUR_THREAD);
  return row;
}

async function touchThread(ctx: MutationCtx, activity: ThreadActivity): Promise<void> {
  const row = await ctx.db
    .query("threads")
    .withIndex("by_thread", (q) => q.eq("threadId", activity.threadId))
    .unique();
  if (row === null) {
    await ctx.db.insert("threads", activity);
  } else if (activity.activeAt > row.activeAt) {
    await ctx.db.patch(row._id, { activeAt: activity.activeAt });
  }
}

function toSummary({ threadId, title, activeAt }: Doc<"threads">): ThreadSummary {
  return { threadId, title, activeAt };
}
