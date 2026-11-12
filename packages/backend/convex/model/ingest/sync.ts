import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import type { Card } from "../../schema";
import { fetchCardsPage, fetchRulingsPage, fetchSitePage, type SiteRuling } from "./goatformat";
import { mentionMatcher } from "./mentions";
import { pageUrls, parseSections, type PageSection } from "./pages";
import { assertComplete, chunk, fetchAllPages, pacer, straddlingSlugs, uniqueById } from "./paging";
import type { CardLinks, Counts, LinkCounts } from "./store";

const REQUEST_GAP_MS = 1000;
const BATCH_SIZE = 100;
const UNMATCHED_SHOWN = 20;

export type Summary = {
  cards: Counts & { deleted: number };
  rulings: Counts & { deleted: number; withoutCard: number };
  notices: Counts & { deleted: number };
  mechanics: Counts & { deleted: number };
  cardLinks: LinkCounts & { unmatchedQuotes: number; mostUnmatched: string[] };
};

export async function syncFromSite(ctx: ActionCtx): Promise<Summary> {
  const pace = pacer(REQUEST_GAP_MS);
  const cards = await fetchCards(pace);
  const rulings = await fetchRulings(cards, pace);
  const passcodeBySlug = new Map(cards.map((card) => [card.slug, card.passcode]));

  const cardCounts = await upsertInBatches(cards, (batch) =>
    ctx.runMutation(internal.ingest.upsertCards, { cards: batch }),
  );

  const owned = rulings.flatMap(({ cardSlug, rulingType, text, sourceUrl }) => {
    const passcode = passcodeBySlug.get(cardSlug);
    return passcode === undefined ? [] : [{ passcode, rulingType, text, sourceUrl }];
  });
  const rulingCounts = await upsertInBatches(owned, (batch) =>
    ctx.runMutation(internal.ingest.upsertRulings, { rulings: batch }),
  );

  const deletedRulings: number = await ctx.runMutation(internal.ingest.deleteStalePassages, {
    kind: "ruling",
    keep: owned.map((ruling) => ruling.sourceUrl),
  });
  const urls = pageUrls(await paced(pace, () => fetchSitePage("/sitemap.xml")));
  const noticeSections = await fetchSections(urls.notices, pace);
  const mechanicSections = await fetchSections(urls.mechanics, pace);
  const notices = await syncSections(ctx, "notice", noticeSections);
  const mechanics = await syncSections(ctx, "mechanic", mechanicSections);

  const match = mentionMatcher(cards);
  const unmatched = new Map<string, number>();
  const links = [
    ...owned.map((ruling) => ({ ...ruling, owner: ruling.passcode })),
    ...noticeSections,
    ...mechanicSections,
  ].map(({ sourceUrl, text, owner }: { sourceUrl: string; text: string; owner?: number }) => {
    const found = match(text);
    for (const name of found.unmatched) unmatched.set(name, (unmatched.get(name) ?? 0) + 1);
    const mentions = found.passcodes.filter((passcode) => passcode !== owner);
    return owner === undefined ? { sourceUrl, mentions } : { sourceUrl, owner, mentions };
  });
  const linkCounts = await syncLinksInBatches(ctx, links);

  const deletedCards: number = await ctx.runMutation(internal.ingest.deleteStaleCards, {
    keep: cards.map((card) => card.passcode),
  });

  return {
    cards: { ...cardCounts, deleted: deletedCards },
    rulings: {
      ...rulingCounts,
      deleted: deletedRulings,
      withoutCard: rulings.length - owned.length,
    },
    notices,
    mechanics,
    cardLinks: {
      ...linkCounts,
      unmatchedQuotes: [...unmatched.values()].reduce((sum, count) => sum + count, 0),
      mostUnmatched: [...unmatched]
        .toSorted(([, a], [, b]) => b - a)
        .slice(0, UNMATCHED_SHOWN)
        .map(([name, count]) => `${name} (${count})`),
    },
  };
}

async function syncLinksInBatches(ctx: ActionCtx, links: CardLinks[]): Promise<LinkCounts> {
  const total: LinkCounts = { inserted: 0, deleted: 0, unchanged: 0 };
  for (const batch of chunk(links, BATCH_SIZE)) {
    const counts: LinkCounts = await ctx.runMutation(internal.ingest.syncCardLinks, {
      passages: batch,
    });
    total.inserted += counts.inserted;
    total.deleted += counts.deleted;
    total.unchanged += counts.unchanged;
  }
  return total;
}

async function fetchCards(pace: () => Promise<void>): Promise<Card[]> {
  const { pages, totalCount } = await fetchAllPages(fetchCardsPage, pace);
  const cards = [...new Map(pages.flat().map((card) => [card.passcode, card])).values()];
  assertComplete("cards", cards.length, totalCount);
  return cards;
}

async function fetchRulings(cards: Card[], pace: () => Promise<void>): Promise<SiteRuling[]> {
  const { pages, totalCount } = await fetchAllPages((page) => fetchRulingsPage(page), pace);
  const straddling = straddlingSlugs(pages);
  const rulings = pages.flat().filter((ruling) => !straddling.has(ruling.cardSlug));
  const nameBySlug = new Map(cards.map((card) => [card.slug, card.name]));
  for (const slug of straddling) {
    const name = nameBySlug.get(slug);
    if (name === undefined) throw new Error(`no card for ruling slug ${slug}`);
    const refetched = await fetchAllPages((page) => fetchRulingsPage(page, name), pace);
    rulings.push(...refetched.pages.flat().filter((ruling) => ruling.cardSlug === slug));
  }
  const unique = uniqueById(rulings);
  assertComplete("rulings", unique.length, totalCount);
  return unique;
}

async function fetchSections(urls: string[], pace: () => Promise<void>): Promise<PageSection[]> {
  const sections: PageSection[] = [];
  for (const url of urls) {
    const html = await paced(pace, () => fetchSitePage(new URL(url).pathname));
    sections.push(...parseSections(html, url));
  }
  return sections;
}

async function syncSections(
  ctx: ActionCtx,
  kind: "notice" | "mechanic",
  sections: PageSection[],
): Promise<Counts & { deleted: number }> {
  const counts = await upsertInBatches(sections, (batch) =>
    ctx.runMutation(internal.ingest.upsertSections, { kind, sections: batch }),
  );
  const deleted: number = await ctx.runMutation(internal.ingest.deleteStalePassages, {
    kind,
    keep: sections.map((section) => section.sourceUrl),
  });
  return { ...counts, deleted };
}

async function paced<T>(pace: () => Promise<void>, request: () => Promise<T>): Promise<T> {
  await pace();
  return request();
}

async function upsertInBatches<T>(
  items: T[],
  upsert: (batch: T[]) => Promise<Counts>,
): Promise<Counts> {
  const total: Counts = { inserted: 0, updated: 0, unchanged: 0 };
  for (const batch of chunk(items, BATCH_SIZE)) {
    const counts = await upsert(batch);
    total.inserted += counts.inserted;
    total.updated += counts.updated;
    total.unchanged += counts.unchanged;
  }
  return total;
}
