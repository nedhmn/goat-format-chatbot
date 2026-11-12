import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { internal } from "../convex/_generated/api";
import schema, { type Card } from "../convex/schema";

const modules = import.meta.glob("../convex/**/*.ts");

const ring: Card = {
  kind: "trap",
  passcode: 4178474,
  slug: "ring-of-destruction",
  name: "Ring of Destruction",
  text: "Destroy 1 face-up monster and inflict damage to both players equal to its ATK.",
  banlist: "forbidden",
  icon: "normal",
};

const lacooda: Card = {
  kind: "monster",
  passcode: 31122090,
  slug: "3-hump-lacooda",
  name: "3-Hump Lacooda",
  text: "If there are 3 face-up 3-Hump Lacooda on your side of the field, tribute 2 of them to draw 3 cards.",
  banlist: "unlimited",
  attribute: "earth",
  race: "Beast",
  level: 3,
  atk: 500,
  def: 1500,
  subtypes: ["effect"],
};

const ringRuling = {
  passcode: ring.passcode,
  rulingType: "faq" as const,
  text: "Ring of Destruction inflicts damage to both players.",
  sourceUrl: "https://beta.goatformat.com/cards/ring-of-destruction#ruling-a",
};

const lacoodaRuling = {
  passcode: lacooda.passcode,
  rulingType: "netrep-ruling" as const,
  text: 'You can chain "Ring of Destruction" to the Lacooda effect.',
  sourceUrl: "https://beta.goatformat.com/cards/3-hump-lacooda#ruling-a",
};

const damageStep = {
  title: "Rulings: Damage Step",
  text: "Only counter traps and cards that modify ATK or DEF can be activated in the damage step.",
  sourceUrl: "https://beta.goatformat.com/learn/rulings#damage-step",
};

async function seeded() {
  const t = convexTest(schema, modules);
  await t.mutation(internal.ingest.store.upsertCards, { cards: [ring, lacooda] });
  await t.mutation(internal.ingest.store.upsertRulings, { rulings: [ringRuling, lacoodaRuling] });
  await t.mutation(internal.ingest.store.upsertSections, {
    kind: "mechanic",
    sections: [damageStep],
  });
  await t.mutation(internal.ingest.store.syncCardLinks, {
    passages: [
      { sourceUrl: ringRuling.sourceUrl, owner: ring.passcode, mentions: [] },
      { sourceUrl: lacoodaRuling.sourceUrl, owner: lacooda.passcode, mentions: [ring.passcode] },
    ],
  });
  return t;
}

describe("readCard", () => {
  it("returns the card, its rulings, and the rulings of other cards that name it", async () => {
    const t = await seeded();
    expect(await t.query(internal.cards.readCard, { name: "Ring of Destruction" })).toEqual({
      found: true,
      card: {
        kind: "trap",
        name: "Ring of Destruction",
        text: ring.text,
        banlist: "forbidden",
        icon: "normal",
      },
      rulings: [
        {
          kind: "ruling",
          card: "Ring of Destruction",
          rulingType: "faq",
          text: ringRuling.text,
          sourceUrl: ringRuling.sourceUrl,
        },
      ],
      mentionedIn: [
        {
          kind: "ruling",
          card: "3-Hump Lacooda",
          rulingType: "netrep-ruling",
          text: lacoodaRuling.text,
          sourceUrl: lacoodaRuling.sourceUrl,
        },
      ],
    });
  });

  it("says when no card has that exact name", async () => {
    const t = await seeded();
    expect(await t.query(internal.cards.readCard, { name: "ring of destruction" })).toEqual({
      found: false,
      name: "ring of destruction",
    });
  });
});

describe("searchPassages", () => {
  it("finds passages by their words and narrows by kind or owning card", async () => {
    const t = await seeded();
    const urls = async (args: { query: string; kind?: "ruling" | "mechanic"; card?: string }) => {
      const result = await t.query(internal.cards.searchPassages, args);
      return result.found ? result.passages.map((passage) => passage.sourceUrl) : result;
    };
    expect(await urls({ query: "damage step" })).toContain(damageStep.sourceUrl);
    expect(await urls({ query: "damage", kind: "ruling" })).not.toContain(damageStep.sourceUrl);
    expect(await urls({ query: "Ring of Destruction", card: "3-Hump Lacooda" })).toEqual([
      lacoodaRuling.sourceUrl,
    ]);
    expect(await urls({ query: "damage", card: "Lacooda" })).toEqual({
      found: false,
      name: "Lacooda",
    });
  });
});
