import { describe, expect, it, vi } from "vitest";

import { PAGE_SIZE, type SiteRuling } from "../convex/ingest/goatformat";
import { chunk, fetchAllPages, straddlingSlugs, uniqueById } from "../convex/ingest/paging";

function ruling(id: string, cardSlug: string): SiteRuling {
  return {
    id,
    cardSlug,
    rulingType: "faq",
    text: `Ruling ${id}`,
    sourceUrl: `https://beta.goatformat.com/cards/${cardSlug}#ruling-${id}`,
  };
}

describe("fetchAllPages", () => {
  it("fetches until the total is covered, pacing every request", async () => {
    const fetchPage = vi.fn(async (page: number) => ({
      items: [page],
      totalCount: PAGE_SIZE * 2 + 1,
    }));
    const beforeRequest = vi.fn(async () => {});
    expect(await fetchAllPages(fetchPage, beforeRequest)).toEqual([[1], [2], [3]]);
    expect(beforeRequest).toHaveBeenCalledTimes(3);
  });

  it("stops at an empty page", async () => {
    const fetchPage = vi.fn(async () => ({ items: [], totalCount: PAGE_SIZE * 5 }));
    expect(await fetchAllPages(fetchPage, async () => {})).toEqual([[]]);
  });
});

describe("straddlingSlugs", () => {
  it("finds cards whose rulings cross a page boundary", () => {
    const pages = [
      [ruling("1", "a"), ruling("2", "b")],
      [ruling("3", "b"), ruling("4", "c")],
      [ruling("5", "d")],
    ];
    expect(straddlingSlugs(pages)).toEqual(new Set(["b"]));
  });
});

describe("uniqueById", () => {
  it("drops a ruling seen on two pages", () => {
    expect(uniqueById([ruling("1", "a"), ruling("1", "a"), ruling("2", "a")])).toHaveLength(2);
  });
});

describe("chunk", () => {
  it("splits into batches with a short last batch", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
