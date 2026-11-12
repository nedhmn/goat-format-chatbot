import { v } from "convex/values";

import { internalQuery } from "./_generated/server";
import { findCardsByName, passagesOfCard, readCardByName, searchPassageText } from "./model/cards";

const searchableKind = v.union(v.literal("ruling"), v.literal("notice"), v.literal("mechanic"));

export const findCards = internalQuery({
  args: { name: v.string() },
  handler: (ctx, { name }) => findCardsByName(ctx, name),
});

export const readCard = internalQuery({
  args: { name: v.string() },
  handler: (ctx, { name }) => readCardByName(ctx, name),
});

export const searchPassages = internalQuery({
  args: { query: v.string(), kind: v.optional(searchableKind), card: v.optional(v.string()) },
  handler: (ctx, args) => searchPassageText(ctx, args),
});

export const passagesForCard = internalQuery({
  args: { cardId: v.id("cards") },
  handler: (ctx, { cardId }) => passagesOfCard(ctx, cardId),
});
