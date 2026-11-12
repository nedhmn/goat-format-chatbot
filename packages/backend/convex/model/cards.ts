import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { Passage } from "../schema";
import { matchCards, type CardMatch } from "./agent/cardNames";

export type PassageView =
  | {
      kind: "ruling";
      card: string;
      rulingType: Extract<Passage, { kind: "ruling" }>["rulingType"];
      text: string;
      sourceUrl: string;
    }
  | { kind: "notice" | "mechanic"; title: string; text: string; sourceUrl: string };

export type CardView = Omit<Doc<"cards">, "_id" | "_creationTime" | "slug" | "passcode">;

export type CardReading =
  | { found: true; card: CardView; rulings: PassageView[]; mentionedIn: PassageView[] }
  | { found: false; name: string };

export type PassageSearch =
  | { found: true; passages: PassageView[] }
  | { found: false; name: string };

export const SEARCH_LIMIT = 8;

export async function findCardsByName(ctx: QueryCtx, name: string): Promise<CardMatch> {
  const cards = await ctx.db.query("cards").collect();
  return matchCards(
    cards.map((card) => ({ name: card.name, kind: card.kind })),
    name,
  );
}

export async function readCardByName(ctx: QueryCtx, name: string): Promise<CardReading> {
  const card = await cardNamed(ctx, name);
  if (!card) return { found: false, name };
  const { _id, _creationTime, slug: _slug, passcode: _passcode, ...view } = card;
  return {
    found: true,
    card: view,
    rulings: await views(ctx, await linkedPassages(ctx, _id, "owner")),
    mentionedIn: await views(ctx, await linkedPassages(ctx, _id, "mention")),
  };
}

export async function searchPassageText(
  ctx: QueryCtx,
  { query, kind, card }: { query: string; kind?: Passage["kind"]; card?: string },
): Promise<PassageSearch> {
  const owner = card === undefined ? undefined : await cardNamed(ctx, card);
  if (card !== undefined && !owner) return { found: false, name: card };
  const passages = await ctx.db
    .query("passages")
    .withSearchIndex("search_text", (q) => {
      const search = q.search("text", query);
      const ofKind = kind ? search.eq("kind", kind) : search;
      return owner ? ofKind.eq("cardId", owner._id) : ofKind;
    })
    .take(SEARCH_LIMIT);
  return { found: true, passages: await views(ctx, passages) };
}

export async function passagesOfCard(
  ctx: QueryCtx,
  cardId: Id<"cards">,
): Promise<{ owned: Doc<"passages">[]; mentioned: Doc<"passages">[] }> {
  return {
    owned: await linkedPassages(ctx, cardId, "owner"),
    mentioned: await linkedPassages(ctx, cardId, "mention"),
  };
}

async function linkedPassages(
  ctx: QueryCtx,
  cardId: Id<"cards">,
  role: "owner" | "mention",
): Promise<Doc<"passages">[]> {
  const links = await ctx.db
    .query("passageCards")
    .withIndex("by_card", (q) => q.eq("cardId", cardId).eq("role", role))
    .collect();
  const passages = await Promise.all(links.map((link) => ctx.db.get(link.passageId)));
  return passages.filter((passage) => passage !== null);
}

async function cardNamed(ctx: QueryCtx, name: string): Promise<Doc<"cards"> | null> {
  return ctx.db
    .query("cards")
    .withIndex("by_name", (q) => q.eq("name", name))
    .first();
}

async function views(ctx: QueryCtx, passages: Doc<"passages">[]): Promise<PassageView[]> {
  return Promise.all(
    passages.map(async (passage): Promise<PassageView> => {
      if (passage.kind !== "ruling") {
        const { kind, title, text, sourceUrl } = passage;
        return { kind, title, text, sourceUrl };
      }
      const { cardId, rulingType, text, sourceUrl } = passage;
      const owner = await ctx.db.get(cardId);
      if (!owner) throw new Error(`no card ${cardId} for ${sourceUrl}`);
      return { kind: "ruling", card: owner.name, rulingType, text, sourceUrl };
    }),
  );
}
