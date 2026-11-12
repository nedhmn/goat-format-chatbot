import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { sendQuestion, threadMessages, viewerThreads } from "./model/chat";

export const send = mutation({
  args: { question: v.string(), threadId: v.optional(v.string()) },
  handler: (ctx, args) => sendQuestion(ctx, args),
});

export const messages = query({
  args: { threadId: v.string(), paginationOpts: paginationOptsValidator, streamArgs: vStreamArgs },
  handler: (ctx, args) => threadMessages(ctx, args),
});

export const threads = query({
  args: {},
  handler: (ctx) => viewerThreads(ctx),
});
