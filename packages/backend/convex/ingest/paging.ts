import { PAGE_SIZE, type Page, type SiteRuling } from "./goatformat";

export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<Page<T>>,
  beforeRequest: () => Promise<void>,
): Promise<T[][]> {
  const pages: T[][] = [];
  for (let page = 1; ; page++) {
    await beforeRequest();
    const { items, totalCount } = await fetchPage(page);
    pages.push(items);
    if (items.length === 0 || page * PAGE_SIZE >= totalCount) return pages;
  }
}

export function pacer(gapMs: number): () => Promise<void> {
  let last = Number.NEGATIVE_INFINITY;
  return async () => {
    const wait = last + gapMs - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    last = Date.now();
  };
}

export function straddlingSlugs(pages: SiteRuling[][]): Set<string> {
  const slugs = new Set<string>();
  for (const [index, page] of pages.entries()) {
    const last = page.at(-1);
    const next = pages[index + 1]?.[0];
    if (last && next && last.cardSlug === next.cardSlug) slugs.add(last.cardSlug);
  }
  return slugs;
}

export function uniqueById(rulings: SiteRuling[]): SiteRuling[] {
  return [...new Map(rulings.map((ruling) => [ruling.id, ruling])).values()];
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}
