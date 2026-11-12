import { cardKey, FUZZY_MIN_LENGTH, withinOneEdit } from "../ingest/mentions";

export type NamedCard = { name: string; kind: "monster" | "spell" | "trap" };

export type CardMatch = {
  match: "exact" | "typo" | "partial" | "none";
  cards: NamedCard[];
  more: number;
};

export const MATCH_LIMIT = 10;

export function matchCards(pool: NamedCard[], query: string): CardMatch {
  const key = cardKey(query);
  if (!key) return { match: "none", cards: [], more: 0 };
  const keyed = pool.map((card) => ({ card, key: cardKey(card.name) }));
  const exact = keyed.filter((entry) => entry.key === key);
  if (exact.length > 0) return result("exact", exact);
  if (key.length >= FUZZY_MIN_LENGTH) {
    const typo = keyed.filter((entry) => withinOneEdit(key, entry.key));
    if (typo.length > 0) return result("typo", typo);
  }
  const queryWords = words(query);
  const partial = keyed.filter(
    (entry) =>
      entry.key.includes(key) ||
      queryWords.every((word) => words(entry.card.name).some((part) => part.startsWith(word))),
  );
  return result(partial.length > 0 ? "partial" : "none", partial);
}

function result(match: CardMatch["match"], found: { card: NamedCard }[]): CardMatch {
  const cards = found
    .map((entry) => entry.card)
    .toSorted((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
  return {
    match,
    cards: cards.slice(0, MATCH_LIMIT),
    more: Math.max(0, cards.length - MATCH_LIMIT),
  };
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}
