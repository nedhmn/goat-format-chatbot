import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { internal } from "../convex/_generated/api";
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

const moon: Card = {
  kind: "spell",
  passcode: 14087893,
  slug: "book-of-moon",
  name: "Book of Moon",
  text: "Select 1 face-up monster on the field and turn it face-down.",
  banlist: "unlimited",
  icon: "quick-play",
};

function moonRuling(id: string, text = `Ruling ${id}`) {
  return {
    passcode: moon.passcode,
    rulingType: "faq" as const,
    text,
    sourceUrl: `https://beta.goatformat.com/cards/book-of-moon#ruling-${id}`,
  };
}

async function seeded() {
  const t = convexTest(schema, modules);
  await t.mutation(internal.ingest.store.upsertCards, { cards: [serpent, moon] });
  return t;
}

describe("upsertCards", () => {
  it("inserts new cards and leaves them alone on a second run", async () => {
    const t = convexTest(schema, modules);
    expect(await t.mutation(internal.ingest.store.upsertCards, { cards: [serpent, moon] })).toEqual(
      { inserted: 2, updated: 0, unchanged: 0 },
    );
    expect(await t.mutation(internal.ingest.store.upsertCards, { cards: [moon, serpent] })).toEqual(
      { inserted: 0, updated: 0, unchanged: 2 },
    );
  });

  it("replaces a card the site changed, keyed on its passcode", async () => {
    const t = await seeded();
    const errata = { ...serpent, text: "Once per turn, during your Standby Phase..." };
    expect(await t.mutation(internal.ingest.store.upsertCards, { cards: [errata] })).toEqual({
      inserted: 0,
      updated: 1,
      unchanged: 0,
    });
    const stored = await t.run((ctx) => ctx.db.query("cards").collect());
    expect(stored).toHaveLength(2);
    expect(stored.find((card) => card.passcode === serpent.passcode)?.text).toBe(errata.text);
  });
});

describe("upsertRulings", () => {
  it("attaches rulings to their card and leaves them alone on a second run", async () => {
    const t = await seeded();
    const rulings = [moonRuling("a"), moonRuling("b")];
    expect(await t.mutation(internal.ingest.store.upsertRulings, { rulings })).toEqual({
      inserted: 2,
      updated: 0,
      unchanged: 0,
    });
    expect(await t.mutation(internal.ingest.store.upsertRulings, { rulings })).toEqual({
      inserted: 0,
      updated: 0,
      unchanged: 2,
    });
    const card = await t.run((ctx) =>
      ctx.db
        .query("cards")
        .withIndex("by_passcode", (q) => q.eq("passcode", moon.passcode))
        .unique(),
    );
    const passages = await t.run((ctx) => ctx.db.query("passages").collect());
    expect(passages.map((passage) => passage.kind === "ruling" && passage.cardId)).toEqual([
      card?._id,
      card?._id,
    ]);
  });

  it("updates a ruling whose text changed", async () => {
    const t = await seeded();
    await t.mutation(internal.ingest.store.upsertRulings, { rulings: [moonRuling("a")] });
    expect(
      await t.mutation(internal.ingest.store.upsertRulings, {
        rulings: [moonRuling("a", "Reworded")],
      }),
    ).toEqual({ inserted: 0, updated: 1, unchanged: 0 });
  });

  it("refuses a ruling for a card that is not stored", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(internal.ingest.store.upsertRulings, { rulings: [moonRuling("a")] }),
    ).rejects.toThrow(/no card with passcode/);
  });
});

describe("deleting what the site no longer lists", () => {
  it("deletes a dropped card along with its rulings", async () => {
    const t = await seeded();
    await t.mutation(internal.ingest.store.upsertRulings, { rulings: [moonRuling("a")] });
    expect(
      await t.mutation(internal.ingest.store.deleteStaleCards, { keep: [serpent.passcode] }),
    ).toBe(1);
    const left = await t.run(async (ctx) => ({
      cards: await ctx.db.query("cards").collect(),
      passages: await ctx.db.query("passages").collect(),
    }));
    expect(left.cards.map((card) => card.name)).toEqual(["Sinister Serpent"]);
    expect(left.passages).toEqual([]);
  });

  it("deletes stale passages of one kind and keeps the rest", async () => {
    const t = await seeded();
    const kept = moonRuling("a");
    await t.mutation(internal.ingest.store.upsertRulings, {
      rulings: [kept, moonRuling("b")],
    });
    await t.run((ctx) =>
      ctx.db.insert("passages", {
        kind: "notice",
        title: "Ruling notice",
        text: "Notice text",
        sourceUrl: "https://beta.goatformat.com/articles/ruling-notice-1",
      }),
    );
    expect(
      await t.mutation(internal.ingest.store.deleteStalePassages, {
        kind: "ruling",
        keep: [kept.sourceUrl],
      }),
    ).toBe(1);
    const left = await t.run((ctx) => ctx.db.query("passages").collect());
    expect(left.map((passage) => passage.sourceUrl).toSorted()).toEqual(
      [kept.sourceUrl, "https://beta.goatformat.com/articles/ruling-notice-1"].toSorted(),
    );
  });
});
