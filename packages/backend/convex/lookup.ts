import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internalQuery, type QueryCtx } from "./_generated/server";
import { matchCards } from "./agent/cardNames";
import type { Passage } from "./schema";

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

const searchableKind = v.union(v.literal("ruling"), v.literal("notice"), v.literal("mechanic"));

export const findCards = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const cards = await ctx.db.query("cards").collect();
    return matchCards(
      cards.map((card) => ({ name: card.name, kind: card.kind })),
      name,
    );
  },
});

export const readCard = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, { name }): Promise<CardReading> => {
    const card = await cardNamed(ctx, name);
    if (!card) return { found: false, name };
    const { _id, _creationTime, slug: _slug, passcode: _passcode, ...view } = card;
    return {
      found: true,
      card: view,
      rulings: await views(ctx, await linkedPassages(ctx, _id, "owner")),
      mentionedIn: await views(ctx, await linkedPassages(ctx, _id, "mention")),
    };
  },
});

export const searchPassages = internalQuery({
  args: { query: v.string(), kind: v.optional(searchableKind), card: v.optional(v.string()) },
  handler: async (ctx, { query, kind, card }): Promise<PassageSearch> => {
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
  },
});

export const passagesForCard = internalQuery({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => ({
    owned: await linkedPassages(ctx, cardId, "owner"),
    mentioned: await linkedPassages(ctx, cardId, "mention"),
  }),
});

async function linkedPassages(
  ctx: QueryCtx,
  cardId: Doc<"cards">["_id"],
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
