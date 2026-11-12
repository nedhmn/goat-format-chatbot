import { listMessages, mockModel } from "@convex-dev/agent";
import agentComponent from "@convex-dev/agent/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { components } from "../convex/_generated/api";
import { openRouterModel, rulingsAgent } from "../convex/agent/agent";
import { answer } from "../convex/chat";
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
