import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import {
  backfillThreads as backfill,
  searchViewerThreads,
  sendQuestion,
  threadMessages,
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

export const backfillThreads = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: (ctx, { cursor }) => backfill(ctx, cursor),
});
