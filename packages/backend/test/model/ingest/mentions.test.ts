import { describe, expect, it } from "vitest";

import {
  cardKey,
  mentionMatcher,
  quotedNames,
  withinOneEdit,
} from "../../../convex/model/ingest/mentions";

const pool = [
  { passcode: 1, name: "Ring of Destruction" },
  { passcode: 2, name: "Book of Moon" },
  { passcode: 3, name: "Gradius' Option" },
  { passcode: 4, name: "Lord of D." },
  { passcode: 5, name: "Command Knight" },
  { passcode: 6, name: "Reload" },
  { passcode: 7, name: "Dark Magician" },
  { passcode: 8, name: "Dark Magicians" },
];

const match = mentionMatcher(pool);

describe("cardKey", () => {
  it("ignores case, spacing, punctuation, and a trailing possessive", () => {
    expect(cardKey("Lord of D.")).toBe(cardKey("lord of d"));
    expect(cardKey("Ring of Destruction's")).toBe(cardKey("Ring of Destruction"));
    expect(cardKey("Gradius’ Option")).toBe(cardKey("Gradius' Option"));
    expect(cardKey("Command Knight(s)")).toBe(cardKey("Command Knight"));
  });
});

describe("quotedNames", () => {
  it("reads straight and curly quoted strings", () => {
    expect(quotedNames('Chain "Ring of Destruction" to “Book of Moon”.')).toEqual([
      "Ring of Destruction",
      "Book of Moon",
    ]);
  });
});

describe("mentionMatcher", () => {
  it("links quoted card names once each", () => {
    expect(
      match('"Ring of Destruction" and "Book of Moon" and "ring of destruction"').passcodes,
    ).toEqual([1, 2]);
  });

  it("forgives a plural, a possessive, or a one-letter typo in a long name", () => {
    expect(match('"Gradius\'s Option" "Command Knights" "Ring of Destrction"').passcodes).toEqual([
      3, 5, 1,
    ]);
  });

  it("matches short names exactly only", () => {
    expect(match('"Relaod" "Reload"')).toEqual({ passcodes: [6], unmatched: ["Relaod"] });
  });

  it("skips a near match that fits two cards", () => {
    expect(match('"Dark Magicianss"').passcodes).toEqual([8]);
    expect(match('"Dark Magiciann"')).toEqual({ passcodes: [], unmatched: ["Dark Magiciann"] });
  });

  it("ignores card names outside quotes and reports quoted strings that are not cards", () => {
    expect(match('Book of Moon can be chained. The monster is "destroyed".')).toEqual({
      passcodes: [],
      unmatched: ["destroyed"],
    });
  });
});

describe("withinOneEdit", () => {
  it("allows one insertion, deletion, or substitution", () => {
    expect(withinOneEdit("needlewall", "needlewalls")).toBe(true);
    expect(withinOneEdit("needlewall", "needleball")).toBe(true);
    expect(withinOneEdit("needlewall", "needlebal")).toBe(false);
  });
});
