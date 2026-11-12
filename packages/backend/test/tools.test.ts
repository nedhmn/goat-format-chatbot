import { listMessages, mockModel } from "@convex-dev/agent";
import agentComponent from "@convex-dev/agent/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { components, internal } from "../convex/_generated/api";
import { rulingsAgent } from "../convex/agent/agent";
import { answer } from "../convex/chat";
import schema, { type Card } from "../convex/schema";

const modules = import.meta.glob("../convex/**/*.ts");

const serpent: Card = {
  kind: "monster",
  passcode: 8131171,
  slug: "sinister-serpent",
  name: "Sinister Serpent",
  text: "During your Standby Phase, if this card is in your Graveyard...",
  banlist: "limited",
  attribute: "water",
  race: "Reptile",
  level: 1,
  atk: 300,
  def: 250,
  subtypes: ["effect"],
};

async function seeded() {
  const t = convexTest(schema, modules);
  agentComponent.register(t);
  await t.mutation(internal.ingest.store.upsertCards, { cards: [serpent] });
  return t;
}

async function toolOutputs(t: Awaited<ReturnType<typeof seeded>>, threadId: string) {
  const messages = await t.run((ctx) =>
    listMessages(ctx, components.agent, {
      threadId,
      paginationOpts: { cursor: null, numItems: 20 },
    }),
  );
  return messages.page.flatMap(({ message }) =>
    message?.role === "tool"
      ? message.content.flatMap((part) => (part.type === "tool-result" ? [part.output] : []))
      : [],
  );
}

describe("findCard", () => {
  it("resolves a misspelled card name for the agent", async () => {
    const t = await seeded();
    const agent = rulingsAgent(
      mockModel({
        contentSteps: [
          [
            {
              type: "tool-call",
              toolCallId: "call-1",
              toolName: "findCard",
              input: JSON.stringify({ name: "sinister serpant" }),
            },
          ],
          [{ type: "text", text: "You mean Sinister Serpent." }],
        ],
      }),
    );
    const { threadId, text } = await t.action((ctx) =>
      answer(ctx, agent, { question: "What does sinister serpant do?" }),
    );
    expect(text).toBe("You mean Sinister Serpent.");
    expect(await toolOutputs(t, threadId)).toEqual([
      {
        type: "json",
        value: { match: "typo", cards: [{ name: "Sinister Serpent", kind: "monster" }], more: 0 },
      },
    ]);
  });
});
