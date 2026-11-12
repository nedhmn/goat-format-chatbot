import { listMessages, mockModel } from "@convex-dev/agent";
import agentComponent from "@convex-dev/agent/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { components, internal } from "../../../convex/_generated/api";
import { ANSWER_NOW, MAX_STEPS, rulingsAgent } from "../../../convex/model/agent/agent";
import { answer } from "../../../convex/model/agent/answer";
import schema, { type Card } from "../../../convex/schema";

const modules = import.meta.glob("../../../convex/**/*.ts");

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
  await t.mutation(internal.ingest.upsertCards, { cards: [serpent] });
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

describe("the step limit", () => {
  it("takes the tools away on the last step and tells the agent to answer", async () => {
    const t = await seeded();
    const lookup = {
      type: "tool-call" as const,
      toolCallId: "call",
      toolName: "findCard",
      input: JSON.stringify({ name: "serpent" }),
    };
    const model = mockModel({
      contentSteps: [
        ...Array.from({ length: MAX_STEPS - 1 }, (_, i) => [
          { ...lookup, toolCallId: `call-${i}` },
        ]),
        [{ type: "text", text: "Sinister Serpent returns to the hand." }],
      ],
    });
    const offeredTools: number[] = [];
    const lastPrompts: string[] = [];
    const recording: typeof model = {
      ...model,
      doGenerate: (options) => {
        offeredTools.push(options.tools?.length ?? 0);
        lastPrompts.push(JSON.stringify(options.prompt.at(-1)));
        return model.doGenerate(options);
      },
    };
    const { text } = await t.action((ctx) =>
      answer(ctx, rulingsAgent(recording), { question: "What does serpent do?" }),
    );
    expect(text).toBe("Sinister Serpent returns to the hand.");
    expect(offeredTools).toHaveLength(MAX_STEPS);
    expect(offeredTools.at(-1)).toBe(0);
    expect(offeredTools.at(-2)).toBe(3);
    expect(lastPrompts.at(-1)).toContain(ANSWER_NOW);
    expect(lastPrompts.at(-2)).not.toContain(ANSWER_NOW);
  });
});
