import { createThread, listMessages, mockModel, saveMessage } from "@convex-dev/agent";
import agentComponent from "@convex-dev/agent/test";
import rateLimiterComponent from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, components, internal } from "../convex/_generated/api";
import { openRouterModel, rulingsAgent } from "../convex/model/agent/agent";
import { answer, streamReply } from "../convex/model/agent/answer";
import {
  BACKFILL_BATCH,
  NOT_YOUR_THREAD,
  OWNER,
  threadTitle,
  TITLE_LENGTH,
  UNTITLED,
} from "../convex/model/chat";
import { QUESTIONS_PER_MINUTE, tooManyQuestions } from "../convex/model/limits";
import schema from "../convex/schema";

const modules = import.meta.glob("../convex/**/*.ts");

const agent = rulingsAgent(
  mockModel({ content: [{ type: "text", text: "Yes, in the damage step." }] }),
);

describe("answer", () => {
  it("answers in a new thread and continues it when given the thread", async () => {
    const t = convexTest(schema, modules);
    agentComponent.register(t);
    const first = await t.action((ctx) =>
      answer(ctx, agent, { question: "Book of Moon in the damage step?" }),
    );
    expect(first.text).toBe("Yes, in the damage step.");
    const second = await t.action((ctx) =>
      answer(ctx, agent, { question: "And Ring of Destruction?", threadId: first.threadId }),
    );
    expect(second.threadId).toBe(first.threadId);
    const messages = await t.run((ctx) =>
      listMessages(ctx, components.agent, {
        threadId: first.threadId,
        paginationOpts: { cursor: null, numItems: 10 },
      }),
    );
    expect(messages.page).toHaveLength(4);
  });
});

describe("openRouterModel", () => {
  it("says how to set the key when it is missing", () => {
    expect(() => openRouterModel("")).toThrow(/OPENROUTER_API_KEY is not set/);
    expect(() => openRouterModel(undefined)).toThrow(/OPENROUTER_API_KEY is not set/);
  });
});

const firstPage = { cursor: null, numItems: 10 };

function backend() {
  const t = convexTest(schema, modules);
  agentComponent.register(t);
  rateLimiterComponent.register(t);
  return t;
}

describe("send", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("starts a thread, saves the question, and continues the thread", async () => {
    const t = backend();
    const { threadId } = await t.mutation(api.chat.send, { question: "Book of Moon?" });
    const again = await t.mutation(api.chat.send, { question: "And Ring?", threadId });
    expect(again.threadId).toBe(threadId);
    const { page } = await t.query(api.chat.messages, { threadId, paginationOpts: firstPage });
    expect(page.map((message) => [message.role, message.text])).toEqual([
      ["user", "Book of Moon?"],
      ["user", "And Ring?"],
    ]);
  });

  it("stops questions past the limit and lets them through once the window passes", async () => {
    vi.setSystemTime(new Date("2026-11-12T12:00:00Z"));
    const t = backend();
    for (let i = 0; i < QUESTIONS_PER_MINUTE; i++) {
      await t.mutation(api.chat.send, { question: `Question ${i}` });
    }
    await expect(t.mutation(api.chat.send, { question: "One more" })).rejects.toThrow(
      /^Too many questions\. Try again in (\d+ seconds?|1 minute)\.$/,
    );
    vi.setSystemTime(new Date("2026-11-12T12:01:01Z"));
    await expect(t.mutation(api.chat.send, { question: "One more" })).resolves.toHaveProperty(
      "threadId",
    );
  });

  it("says how to set the key before saving anything when it is missing", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const t = backend();
    await expect(t.mutation(api.chat.send, { question: "Book of Moon?" })).rejects.toThrow(
      /OPENROUTER_API_KEY is not set/,
    );
  });
});

describe("messages", () => {
  it("lists the streamed reply after the question", async () => {
    const t = backend();
    const prompt = await t.mutation(async (ctx) => {
      const threadId = await createThread(ctx, components.agent, { userId: OWNER });
      const { messageId } = await saveMessage(ctx, components.agent, {
        threadId,
        prompt: "Book of Moon in the damage step?",
      });
      return { threadId, promptMessageId: messageId };
    });
    await t.action((ctx) => streamReply(ctx, agent, prompt, 0));
    const { page } = await t.query(api.chat.messages, {
      threadId: prompt.threadId,
      paginationOpts: firstPage,
    });
    expect(page.map((message) => [message.role, message.text, message.status])).toEqual([
      ["user", "Book of Moon in the damage step?", "success"],
      ["assistant", "Yes, in the damage step.", "success"],
    ]);
  });

  it("refuses a thread that belongs to another user", async () => {
    const t = backend();
    const threadId = await t.mutation((ctx) =>
      createThread(ctx, components.agent, { userId: "someone-else" }),
    );
    await expect(
      t.query(api.chat.messages, { threadId, paginationOpts: firstPage }),
    ).rejects.toThrow(NOT_YOUR_THREAD);
  });
});

describe("threads", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("lists the owner's threads by last activity, titled from their first question", async () => {
    const t = backend();
    const first = await t.mutation(api.chat.send, { question: "Book of Moon?" });
    vi.advanceTimersByTime(1_000);
    const second = await t.mutation(api.chat.send, { question: "  Sangan\n banished? " });
    vi.advanceTimersByTime(1_000);
    await t.mutation(api.chat.send, { question: "And Ring?", threadId: first.threadId });
    await t.run((ctx) =>
      ctx.db.insert("threads", {
        threadId: "elsewhere",
        userId: "someone-else",
        title: "Book of Moon?",
        activeAt: Date.now() + 1_000,
      }),
    );
    const { page } = await t.query(api.chat.threads, { paginationOpts: firstPage });
    expect(page.map((thread) => [thread.threadId, thread.title])).toEqual([
      [first.threadId, "Book of Moon?"],
      [second.threadId, "Sangan banished?"],
    ]);
  });

  it("pages through threads", async () => {
    const t = backend();
    for (const question of ["One?", "Two?", "Three?"]) {
      await t.mutation(api.chat.send, { question });
      vi.advanceTimersByTime(1_000);
    }
    const one = await t.query(api.chat.threads, { paginationOpts: { cursor: null, numItems: 2 } });
    const two = await t.query(api.chat.threads, {
      paginationOpts: { cursor: one.continueCursor, numItems: 2 },
    });
    expect([...one.page, ...two.page].map((thread) => thread.title)).toEqual([
      "Three?",
      "Two?",
      "One?",
    ]);
    expect(two.isDone).toBe(true);
  });

  it("searches the owner's thread titles", async () => {
    const t = backend();
    const moon = await t.mutation(api.chat.send, { question: "Book of Moon in the damage step?" });
    await t.mutation(api.chat.send, { question: "Sangan banished?" });
    await t.run((ctx) =>
      ctx.db.insert("threads", {
        threadId: "elsewhere",
        userId: "someone-else",
        title: "Moon again?",
        activeAt: Date.now(),
      }),
    );
    const found = await t.query(api.chat.searchThreads, { query: "moon" });
    expect(found.map((thread) => thread.threadId)).toEqual([moon.threadId]);
    expect(await t.query(api.chat.searchThreads, { query: "  " })).toEqual([]);
  });

  it("backfills threads by their last message", async () => {
    const t = backend();
    const older = await t.mutation((ctx) =>
      createThread(ctx, components.agent, { userId: OWNER, title: "Book of Moon?" }),
    );
    vi.advanceTimersByTime(1_000);
    const untitled = await t.mutation((ctx) =>
      createThread(ctx, components.agent, { userId: OWNER }),
    );
    for (let made = 0; made < BACKFILL_BATCH; made += 1) {
      await t.mutation((ctx) => createThread(ctx, components.agent, { userId: OWNER }));
    }
    vi.advanceTimersByTime(1_000);
    await t.mutation((ctx) =>
      saveMessage(ctx, components.agent, { threadId: older, userId: OWNER, prompt: "And Ring?" }),
    );
    await t.mutation(internal.chat.backfillThreads, { cursor: null });
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    const { page, isDone } = await t.query(api.chat.threads, {
      paginationOpts: { cursor: null, numItems: BACKFILL_BATCH + 2 },
    });
    expect(page).toHaveLength(BACKFILL_BATCH + 2);
    expect(isDone).toBe(true);
    expect(page[0]).toMatchObject({ threadId: older, title: "Book of Moon?" });
    expect(page.find((thread) => thread.threadId === untitled)?.title).toBe(UNTITLED);
  });
});

describe("threadTitle", () => {
  it("shortens a long question", () => {
    const title = threadTitle("Can ".repeat(40));
    expect(title).toHaveLength(TITLE_LENGTH);
    expect(title.endsWith("Can…")).toBe(true);
  });
});

describe("tooManyQuestions", () => {
  it("rounds the wait up to seconds, minutes, or hours", () => {
    expect(tooManyQuestions(1)).toBe("Too many questions. Try again in 1 second.");
    expect(tooManyQuestions(59_000)).toBe("Too many questions. Try again in 59 seconds.");
    expect(tooManyQuestions(59_500)).toBe("Too many questions. Try again in 1 minute.");
    expect(tooManyQuestions(61_000)).toBe("Too many questions. Try again in 2 minutes.");
    expect(tooManyQuestions(5 * 3_600_000)).toBe("Too many questions. Try again in 5 hours.");
  });
});
