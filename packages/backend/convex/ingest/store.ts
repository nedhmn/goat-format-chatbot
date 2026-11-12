import { v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import { internalMutation, type MutationCtx } from "../_generated/server";
import { card, rulingType, type Card, type Passage } from "../schema";

export type Counts = { inserted: number; updated: number; unchanged: number };

export type LinkCounts = { inserted: number; deleted: number; unchanged: number };

const passageKind = v.union(v.literal("ruling"), v.literal("notice"), v.literal("mechanic"));

export const upsertCards = internalMutation({
  args: { cards: v.array(card) },
  handler: async (ctx, { cards }) => {
    const counts = emptyCounts();
    for (const next of cards) {
      const existing = await ctx.db
        .query("cards")
        .withIndex("by_passcode", (q) => q.eq("passcode", next.passcode))
        .unique();
      if (!existing) {
        await ctx.db.insert("cards", next);
        counts.inserted++;
      } else if (isUnchanged<Card>(existing, next)) {
        counts.unchanged++;
      } else {
        await ctx.db.replace(existing._id, next);
        counts.updated++;
      }
    }
    return counts;
  },
});

export const upsertRulings = internalMutation({
  args: {
    rulings: v.array(
      v.object({ passcode: v.number(), rulingType, text: v.string(), sourceUrl: v.string() }),
    ),
  },
  handler: async (ctx, { rulings }) => {
    const counts = emptyCounts();
    for (const { passcode, ...ruling } of rulings) {
      const owner = await ctx.db
        .query("cards")
        .withIndex("by_passcode", (q) => q.eq("passcode", passcode))
        .unique();
      if (!owner) throw new Error(`no card with passcode ${passcode} for ${ruling.sourceUrl}`);
      counts[await upsertPassage(ctx, { kind: "ruling", cardId: owner._id, ...ruling })]++;
    }
    return counts;
  },
});

export const upsertSections = internalMutation({
  args: {
    kind: v.union(v.literal("notice"), v.literal("mechanic")),
    sections: v.array(v.object({ title: v.string(), text: v.string(), sourceUrl: v.string() })),
  },
  handler: async (ctx, { kind, sections }) => {
    const counts = emptyCounts();
    for (const section of sections) {
      counts[await upsertPassage(ctx, { kind, ...section })]++;
    }
    return counts;
  },
});

export const deleteStaleCards = internalMutation({
  args: { keep: v.array(v.number()) },
  handler: async (ctx, { keep }) => {
    const kept = new Set(keep);
    let deleted = 0;
    for (const stale of await ctx.db.query("cards").collect()) {
      if (kept.has(stale.passcode)) continue;
      const passages = await ctx.db
        .query("passages")
        .withIndex("by_card", (q) => q.eq("cardId", stale._id))
        .collect();
      for (const passage of passages) await deletePassage(ctx, passage._id);
      const links = await ctx.db
        .query("passageCards")
        .withIndex("by_card", (q) => q.eq("cardId", stale._id))
        .collect();
      for (const link of links) await ctx.db.delete(link._id);
      await ctx.db.delete(stale._id);
      deleted++;
    }
    return deleted;
  },
});

export const deleteStalePassages = internalMutation({
  args: { kind: passageKind, keep: v.array(v.string()) },
  handler: async (ctx, { kind, keep }) => {
    const kept = new Set(keep);
    let deleted = 0;
    for (const passage of await ctx.db.query("passages").collect()) {
      if (passage.kind !== kind || kept.has(passage.sourceUrl)) continue;
      await deletePassage(ctx, passage._id);
      deleted++;
    }
    return deleted;
  },
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
  handler: async (ctx, { passages }) => {
    const counts: LinkCounts = { inserted: 0, deleted: 0, unchanged: 0 };
    for (const { sourceUrl, owner, mentions } of passages) {
      const passage = await ctx.db
        .query("passages")
        .withIndex("by_source_url", (q) => q.eq("sourceUrl", sourceUrl))
        .unique();
      if (!passage) throw new Error(`no passage at ${sourceUrl}`);
      const wanted = new Map<Id<"cards">, "owner" | "mention">();
      for (const passcode of mentions)
        wanted.set(await cardId(ctx, passcode, sourceUrl), "mention");
      if (owner !== undefined) wanted.set(await cardId(ctx, owner, sourceUrl), "owner");
      const existing = await ctx.db
        .query("passageCards")
        .withIndex("by_passage", (q) => q.eq("passageId", passage._id))
        .collect();
      for (const link of existing) {
        if (wanted.get(link.cardId) === link.role) {
          wanted.delete(link.cardId);
          counts.unchanged++;
        } else {
          await ctx.db.delete(link._id);
          counts.deleted++;
        }
      }
      for (const [linkedCard, role] of wanted) {
        await ctx.db.insert("passageCards", { passageId: passage._id, cardId: linkedCard, role });
        counts.inserted++;
      }
    }
    return counts;
  },
});

async function cardId(ctx: MutationCtx, passcode: number, sourceUrl: string): Promise<Id<"cards">> {
  const found = await ctx.db
    .query("cards")
    .withIndex("by_passcode", (q) => q.eq("passcode", passcode))
    .unique();
  if (!found) throw new Error(`no card with passcode ${passcode} for ${sourceUrl}`);
  return found._id;
}

async function deletePassage(ctx: MutationCtx, passageId: Id<"passages">): Promise<void> {
  const links = await ctx.db
    .query("passageCards")
    .withIndex("by_passage", (q) => q.eq("passageId", passageId))
    .collect();
  for (const link of links) await ctx.db.delete(link._id);
  await ctx.db.delete(passageId);
}

async function upsertPassage(ctx: MutationCtx, next: Passage): Promise<keyof Counts> {
  const existing = await ctx.db
    .query("passages")
    .withIndex("by_source_url", (q) => q.eq("sourceUrl", next.sourceUrl))
    .unique();
  if (!existing) {
    await ctx.db.insert("passages", next);
    return "inserted";
  }
  if (isUnchanged<Passage>(existing, next)) return "unchanged";
  await ctx.db.replace(existing._id, next);
  return "updated";
}

function emptyCounts(): Counts {
  return { inserted: 0, updated: 0, unchanged: 0 };
}

function isUnchanged<T extends object>(existing: T, next: T): boolean {
  const keys = new Set([...Object.keys(existing), ...Object.keys(next)]);
  keys.delete("_id");
  keys.delete("_creationTime");
  return [...keys].every(
    (key) => JSON.stringify(existing[key as keyof T]) === JSON.stringify(next[key as keyof T]),
  );
}
