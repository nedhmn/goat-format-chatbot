import { describe, expect, it } from "vitest";

import { pageUrls, parseSections } from "../convex/ingest/pages";
import { learnPage, noticePage, pageWithoutBody, sitemap } from "./fixtures/pages";

const rulingsUrl = "https://beta.goatformat.com/learn/rulings";
const noticeUrl = "https://beta.goatformat.com/articles/ruling-notice-mind-crush";

describe("pageUrls", () => {
  it("keeps ruling notices and the gameplay learn pages on the site, once each", () => {
    expect(pageUrls(sitemap)).toEqual({
      notices: [noticeUrl],
      mechanics: ["https://beta.goatformat.com/learn/goat-format-history", rulingsUrl],
    });
  });
});

describe("parseSections", () => {
  it("splits a page at its anchored headings, linking each section", () => {
    expect(
      parseSections(learnPage, rulingsUrl).map(({ title, sourceUrl }) => ({ title, sourceUrl })),
    ).toEqual([
      { title: "Rulings", sourceUrl: rulingsUrl },
      { title: "Rulings: Priority", sourceUrl: `${rulingsUrl}#priority` },
      { title: "Rulings: The Damage Step", sourceUrl: `${rulingsUrl}#the-damage-step` },
    ]);
  });

  it("writes the article as Markdown and drops embedded widgets", () => {
    const [, priority, damageStep] = parseSections(learnPage, rulingsUrl);
    expect(priority?.text).toBe(
      [
        "After a chain or summon resolves, the turn player acts first.",
        "- You don't need to call priority.\n- Priority has nothing to do with **Trigger Effects**.",
      ].join("\n\n"),
    );
    expect(damageStep?.text).toBe(
      [
        "Only Counter Traps and cards that change ATK or DEF can be activated.",
        "### Flip effects",
        "A flipped monster's effect resolves after damage calculation.",
      ].join("\n\n"),
    );
  });

  it("leaves out the page chrome around the article", () => {
    const text = parseSections(learnPage, rulingsUrl)
      .map((section) => section.text)
      .join("\n");
    expect(text).not.toMatch(/On this page|Share this page|Join the community|Keep reading/);
  });

  it("reads a notice without headings as one section", () => {
    expect(parseSections(noticePage, noticeUrl)).toEqual([
      {
        title: "Ruling Notice: Mind Crush",
        sourceUrl: noticeUrl,
        text: [
          "The Judge Corps has issued a ruling update for Mind Crush.",
          '> **Ruling:** "Hand verification only occurs when the opponent has *no* copies."\n> Source: Judge Corps',
          "1. Declare a card.\n2. Check the hand.",
          "This applies to paper events only.",
        ].join("\n\n"),
      },
    ]);
  });

  it("rejects a page whose article layout changed", () => {
    expect(() => parseSections(pageWithoutBody, rulingsUrl)).toThrow(/no article/);
  });
});
