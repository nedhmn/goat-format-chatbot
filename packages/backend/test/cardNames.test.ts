import { describe, expect, it } from "vitest";

import { matchCards, MATCH_LIMIT, type NamedCard } from "../convex/agent/cardNames";

const pool: NamedCard[] = [
  { name: "Sinister Serpent", kind: "monster" },
  { name: "Book of Moon", kind: "spell" },
  { name: "Book of Taiyou", kind: "spell" },
  { name: "Black Luster Soldier - Envoy of the Beginning", kind: "monster" },
  { name: "3-Hump Lacooda", kind: "monster" },
  { name: "Dark Magician", kind: "monster" },
  { name: "Dark Magicians", kind: "monster" },
];

const names = (query: string) => matchCards(pool, query).cards.map((card) => card.name);

describe("matchCards", () => {
  it("matches a name regardless of case and punctuation", () => {
    expect(matchCards(pool, "book of MOON")).toEqual({
      match: "exact",
      cards: [{ name: "Book of Moon", kind: "spell" }],
      more: 0,
    });
    expect(names("3 hump lacooda")).toEqual(["3-Hump Lacooda"]);
  });

  it("forgives a one-letter typo in a long name", () => {
    expect(matchCards(pool, "sinister serpant").match).toBe("typo");
    expect(names("sinister serpant")).toEqual(["Sinister Serpent"]);
  });

  it("returns every card a typo could mean", () => {
    expect(names("dark magiciann")).toEqual(["Dark Magician", "Dark Magicians"]);
  });

  it("finds cards from part of the name or some of its words", () => {
    expect(matchCards(pool, "lacooda")).toMatchObject({
      match: "partial",
      cards: [{ name: "3-Hump Lacooda" }],
    });
    expect(names("envoy beginning")).toEqual(["Black Luster Soldier - Envoy of the Beginning"]);
    expect(names("book of")).toEqual(["Book of Moon", "Book of Taiyou"]);
  });

  it("says when nothing matches, including shorthand it cannot expand", () => {
    expect(matchCards(pool, "BLS")).toEqual({ match: "none", cards: [], more: 0 });
    expect(matchCards(pool, "  ")).toEqual({ match: "none", cards: [], more: 0 });
  });

  it("caps the candidates and counts the rest", () => {
    const many = Array.from({ length: MATCH_LIMIT + 3 }, (_, i) => ({
      name: `Gate Guardian Mark ${i}`,
      kind: "monster" as const,
    }));
    const found = matchCards(many, "guardian");
    expect(found.cards).toHaveLength(MATCH_LIMIT);
    expect(found.more).toBe(3);
  });
});
