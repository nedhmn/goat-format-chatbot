import { v } from "convex/values";

import { internalAction, internalMutation } from "./_generated/server";
import {
  linkPassagesToCards,
  removeStaleCards,
  removeStalePassages,
  storeCards,
  storeRulings,
  storeSections,
} from "./model/ingest/store";
import { syncFromSite, type Summary } from "./model/ingest/sync";
import { card, rulingType } from "./schema";

const passageKind = v.union(v.literal("ruling"), v.literal("notice"), v.literal("mechanic"));

export const run = internalAction({
  args: {},
  handler: (ctx): Promise<Summary> => syncFromSite(ctx),
});

export const upsertCards = internalMutation({
  args: { cards: v.array(card) },
  handler: (ctx, { cards }) => storeCards(ctx, cards),
});

export const upsertRulings = internalMutation({
  args: {
    rulings: v.array(
      v.object({ passcode: v.number(), rulingType, text: v.string(), sourceUrl: v.string() }),
    ),
  },
  handler: (ctx, { rulings }) => storeRulings(ctx, rulings),
});

export const upsertSections = internalMutation({
  args: {
    kind: v.union(v.literal("notice"), v.literal("mechanic")),
    sections: v.array(v.object({ title: v.string(), text: v.string(), sourceUrl: v.string() })),
  },
  handler: (ctx, { kind, sections }) => storeSections(ctx, kind, sections),
});

export const deleteStaleCards = internalMutation({
  args: { keep: v.array(v.number()) },
  handler: (ctx, { keep }) => removeStaleCards(ctx, keep),
});

export const deleteStalePassages = internalMutation({
  args: { kind: passageKind, keep: v.array(v.string()) },
  handler: (ctx, { kind, keep }) => removeStalePassages(ctx, kind, keep),
});

export const syncCardLinks = internalMutation({
  args: {
    passages: v.array(
      v.object({
        sourceUrl: v.string(),
        owner: v.optional(v.number()),
        mentions: v.array(v.number()),
      }),
    ),
  },
  handler: (ctx, { passages }) => linkPassagesToCards(ctx, passages),
});
