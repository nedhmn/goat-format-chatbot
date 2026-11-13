import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import {
  backfillThreads as backfill,
  pinThread,
  removeThread,
  renameThread,
  searchViewerThreads,
  sendQuestion,
  threadMessages,
  viewerPins,
  viewerThreads,
} from "./model/chat";

export const send = mutation({
  args: { question: v.string(), threadId: v.optional(v.string()) },
  handler: (ctx, args) => sendQuestion(ctx, args),
});

export const messages = query({
  args: { threadId: v.string(), paginationOpts: paginationOptsValidator, streamArgs: vStreamArgs },
  handler: (ctx, args) => threadMessages(ctx, args),
});

export const threads = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: (ctx, { paginationOpts }) => viewerThreads(ctx, paginationOpts),
});

export const searchThreads = query({
  args: { query: v.string() },
  handler: (ctx, { query: words }) => searchViewerThreads(ctx, words),
});

export const pinnedThreads = query({
  args: {},
  handler: (ctx) => viewerPins(ctx),
});

export const pin = mutation({
  args: { threadId: v.string(), pinned: v.boolean() },
  handler: (ctx, args) => pinThread(ctx, args),
});

export const rename = mutation({
  args: { threadId: v.string(), title: v.string() },
  handler: (ctx, args) => renameThread(ctx, args),
});

export const remove = mutation({
  args: { threadId: v.string() },
  handler: (ctx, { threadId }) => removeThread(ctx, threadId),
});

export const backfillThreads = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: (ctx, { cursor }) => backfill(ctx, cursor),
});
