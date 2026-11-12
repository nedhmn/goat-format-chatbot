import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import type { Card, Passage } from "../../schema";

export type Counts = { inserted: number; updated: number; unchanged: number };

export type LinkCounts = { inserted: number; deleted: number; unchanged: number };

type OwnedRuling = Omit<Extract<Passage, { kind: "ruling" }>, "kind" | "cardId"> & {
  passcode: number;
};

type Section = { title: string; text: string; sourceUrl: string };

export type CardLinks = { sourceUrl: string; owner?: number; mentions: number[] };

export async function storeCards(ctx: MutationCtx, cards: Card[]): Promise<Counts> {
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
}

export async function storeRulings(ctx: MutationCtx, rulings: OwnedRuling[]): Promise<Counts> {
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
}

export async function storeSections(
  ctx: MutationCtx,
  kind: "notice" | "mechanic",
  sections: Section[],
): Promise<Counts> {
  const counts = emptyCounts();
  for (const section of sections) {
    counts[await upsertPassage(ctx, { kind, ...section })]++;
  }
  return counts;
}

export async function removeStaleCards(ctx: MutationCtx, keep: number[]): Promise<number> {
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
}

export async function removeStalePassages(
  ctx: MutationCtx,
  kind: Passage["kind"],
  keep: string[],
): Promise<number> {
  const kept = new Set(keep);
  let deleted = 0;
  for (const passage of await ctx.db.query("passages").collect()) {
    if (passage.kind !== kind || kept.has(passage.sourceUrl)) continue;
    await deletePassage(ctx, passage._id);
    deleted++;
  }
  return deleted;
}

export async function linkPassagesToCards(
  ctx: MutationCtx,
  passages: CardLinks[],
): Promise<LinkCounts> {
  const counts: LinkCounts = { inserted: 0, deleted: 0, unchanged: 0 };
  for (const { sourceUrl, owner, mentions } of passages) {
    const passage = await ctx.db
      .query("passages")
      .withIndex("by_source_url", (q) => q.eq("sourceUrl", sourceUrl))
      .unique();
    if (!passage) throw new Error(`no passage at ${sourceUrl}`);
    const wanted = new Map<Id<"cards">, "owner" | "mention">();
    for (const passcode of mentions) wanted.set(await cardId(ctx, passcode, sourceUrl), "mention");
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
}

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
