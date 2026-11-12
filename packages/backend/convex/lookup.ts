import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internalQuery, type QueryCtx } from "./_generated/server";
import { matchCards } from "./agent/cardNames";

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
