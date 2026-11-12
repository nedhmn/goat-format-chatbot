import { createThread, listMessages, mockModel, saveMessage } from "@convex-dev/agent";
import agentComponent from "@convex-dev/agent/test";
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, components } from "../convex/_generated/api";
import { openRouterModel, rulingsAgent } from "../convex/agent/agent";
import { answer, NOT_YOUR_THREAD, streamReply } from "../convex/chat";
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
      const threadId = await createThread(ctx, components.agent);
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
