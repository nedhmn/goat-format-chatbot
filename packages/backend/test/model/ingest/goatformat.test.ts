import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchCardsPage,
  fetchRulingsPage,
  PAGE_SIZE,
  SITE_URL,
} from "../../../convex/model/ingest/goatformat";
import cardsPage from "../../fixtures/cards-page.json";
import rulingsPage from "../../fixtures/rulings-page.json";

type Body = typeof cardsPage | typeof rulingsPage | { result: { data: { json: object } } };

const fetchMock = vi.fn<(url: URL) => Promise<Response>>();

function respondWith(body: Body, status = 200) {
  fetchMock.mockResolvedValueOnce(Response.json(body, { status }));
}

function requested() {
  const [url] = fetchMock.mock.calls[0] ?? [];
  if (!url) throw new Error("fetch was not called");
  return { path: url.pathname, input: JSON.parse(url.searchParams.get("input") ?? "") };
}

function byName<T extends { name: string }>(items: T[], name: string): T {
  const item = items.find((candidate) => candidate.name === name);
  if (!item) throw new Error(`no ${name} in fixture`);
  return item;
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function fetchCardsFixture() {
  respondWith(cardsPage);
  return fetchCardsPage(3);
}

async function fetchRulingsFixture() {
  respondWith(rulingsPage);
  return fetchRulingsPage(1, "Book of Moon");
}

describe("fetchCardsPage", () => {
  it("asks for one page of cards", async () => {
    await fetchCardsFixture();
    expect(requested()).toEqual({
      path: "/api/trpc/card.listCards",
      input: { json: { page: 3, limit: PAGE_SIZE } },
    });
  });

  it("keeps the total for paging", async () => {
    const { items, totalCount } = await fetchCardsFixture();
    expect(totalCount).toBe(1705);
    expect(items).toHaveLength(5);
  });

  it("maps a monster to the card shape with its Goat text", async () => {
    const { items } = await fetchCardsFixture();
    const serpent = byName(items, "Sinister Serpent");
    expect(serpent).toMatchObject({
      kind: "monster",
      passcode: 8131171,
      slug: "sinister-serpent",
      attribute: "water",
      level: 1,
      banlist: "limited",
      subtypes: ["effect"],
    });
    expect(serpent.text).toMatch(/Standby Phase/);
  });

  it("keeps every subtype a monster has", async () => {
    const { items } = await fetchCardsFixture();
    expect(byName(items, "Thousand-Eyes Restrict")).toMatchObject({
      subtypes: ["effect", "fusion"],
    });
  });

  it("lowers spell and trap icons and defaults the banlist", async () => {
    const { items } = await fetchCardsFixture();
    expect(byName(items, "Book of Moon")).toMatchObject({
      kind: "spell",
      icon: "quick-play",
      banlist: "unlimited",
    });
    expect(byName(items, "Ring of Destruction")).toMatchObject({
      kind: "trap",
      icon: "normal",
      banlist: "limited",
    });
  });

  it("rejects a card shape it does not know", async () => {
    const [first, ...rest] = cardsPage.result.data.json.items;
    respondWith({
      result: {
        data: {
          json: { ...cardsPage.result.data.json, items: [{ ...first, type: "Skill" }, ...rest] },
        },
      },
    });
    await expect(fetchCardsPage(1)).rejects.toThrow();
  });
});

describe("fetchRulingsPage", () => {
  it("asks for one card's rulings", async () => {
    await fetchRulingsFixture();
    expect(requested()).toEqual({
      path: "/api/trpc/card.listRulings",
      input: { json: { page: 1, limit: PAGE_SIZE, cardName: "Book of Moon" } },
    });
  });

  it("maps every ruling type", async () => {
    const { items, totalCount } = await fetchRulingsFixture();
    expect(totalCount).toBe(4186);
    expect(items.map((ruling) => ruling.rulingType).toSorted()).toEqual([
      "faq",
      "netrep-qa",
      "netrep-ruling",
    ]);
  });

  it("links each ruling to its anchor on the card page", async () => {
    const { items } = await fetchRulingsFixture();
    for (const ruling of items) {
      expect(ruling.sourceUrl).toBe(`${SITE_URL}/cards/${ruling.cardSlug}#ruling-${ruling.id}`);
    }
  });

  it("rejects a page without items", async () => {
    respondWith({ result: { data: { json: { totalCount: 0 } } } });
    await expect(fetchRulingsPage(1)).rejects.toThrow();
  });

  it("throws on an error status", async () => {
    respondWith(rulingsPage, 503);
    await expect(fetchRulingsPage(1)).rejects.toThrow(/503/);
  });
});
