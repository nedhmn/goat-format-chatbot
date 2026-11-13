import { defineSchema, defineTable } from "convex/server";
import { v, type Infer } from "convex/values";

const banlist = v.union(
  v.literal("forbidden"),
  v.literal("limited"),
  v.literal("semi-limited"),
  v.literal("unlimited"),
);

const attribute = v.union(
  v.literal("dark"),
  v.literal("earth"),
  v.literal("fire"),
  v.literal("light"),
  v.literal("water"),
  v.literal("wind"),
);

const monsterSubtype = v.union(
  v.literal("normal"),
  v.literal("effect"),
  v.literal("fusion"),
  v.literal("ritual"),
  v.literal("flip"),
  v.literal("spirit"),
  v.literal("toon"),
  v.literal("union"),
);

const spellIcon = v.union(
  v.literal("normal"),
  v.literal("continuous"),
  v.literal("equip"),
  v.literal("quick-play"),
  v.literal("field"),
  v.literal("ritual"),
);

const trapIcon = v.union(v.literal("normal"), v.literal("continuous"), v.literal("counter"));

const cardBase = {
  passcode: v.number(),
  slug: v.string(),
  name: v.string(),
  text: v.string(),
  banlist,
};

export const card = v.union(
  v.object({
    ...cardBase,
    kind: v.literal("monster"),
    attribute,
    race: v.string(),
    level: v.number(),
    atk: v.number(),
    def: v.number(),
    subtypes: v.array(monsterSubtype),
  }),
  v.object({ ...cardBase, kind: v.literal("spell"), icon: spellIcon }),
  v.object({ ...cardBase, kind: v.literal("trap"), icon: trapIcon }),
);

export const rulingType = v.union(
  v.literal("faq"),
  v.literal("netrep-ruling"),
  v.literal("netrep-qa"),
);

export const passage = v.union(
  v.object({
    kind: v.literal("ruling"),
    cardId: v.id("cards"),
    rulingType,
    text: v.string(),
    sourceUrl: v.string(),
  }),
  v.object({
    kind: v.literal("notice"),
    title: v.string(),
    text: v.string(),
    sourceUrl: v.string(),
  }),
  v.object({
    kind: v.literal("mechanic"),
    title: v.string(),
    text: v.string(),
    sourceUrl: v.string(),
  }),
);

export const cardRole = v.union(v.literal("owner"), v.literal("mention"));

export const passageCard = v.object({
  passageId: v.id("passages"),
  cardId: v.id("cards"),
  role: cardRole,
});

export const thread = v.object({
  threadId: v.string(),
  userId: v.string(),
  title: v.string(),
  activeAt: v.number(),
  pinnedAt: v.optional(v.number()),
});

export type Card = Infer<typeof card>;
export type Passage = Infer<typeof passage>;

export default defineSchema({
  cards: defineTable(card).index("by_passcode", ["passcode"]).index("by_name", ["name"]),
  passages: defineTable(passage)
    .index("by_source_url", ["sourceUrl"])
    .index("by_card", ["cardId"])
    .searchIndex("search_text", { searchField: "text", filterFields: ["kind", "cardId"] }),
  passageCards: defineTable(passageCard)
    .index("by_card", ["cardId", "role"])
    .index("by_passage", ["passageId"]),
  threads: defineTable(thread)
    .index("by_thread", ["threadId"])
    .index("by_user_pinned_active", ["userId", "pinnedAt", "activeAt"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["userId"] }),
});
