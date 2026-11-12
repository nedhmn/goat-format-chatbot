import type { Infer } from "convex/values";
import { z } from "zod";

import type { Card, rulingType } from "../schema";

export const SITE_URL = "https://beta.goatformat.com";
export const PAGE_SIZE = 100;
const USER_AGENT = "goat-format-chatbot (+https://github.com/nedhmn/goat-format-chatbot)";

export type SiteRuling = {
  id: string;
  cardSlug: string;
  rulingType: Infer<typeof rulingType>;
  text: string;
  sourceUrl: string;
};

export type Page<T> = { items: T[]; totalCount: number };

const banlist = z
  .enum(["forbidden", "limited", "semi-limited"])
  .nullable()
  .transform((status) => status ?? "unlimited");

const cardBase = {
  name: z.string().min(1),
  slug: z.string().min(1),
  ypdId: z.number().int().positive(),
  goatText: z.string().min(1),
  banlistStatus: banlist,
};

const monsterFlags = {
  isNormal: "normal",
  isEffect: "effect",
  isFusion: "fusion",
  isRitual: "ritual",
  isFlip: "flip",
  isSpirit: "spirit",
  isToon: "toon",
  isUnion: "union",
} as const;

const flag = z.boolean().nullable();

const monster = z
  .object({
    ...cardBase,
    type: z.literal("Monster"),
    attribute: z.enum(["DARK", "EARTH", "FIRE", "LIGHT", "WATER", "WIND"]),
    race: z.string().min(1),
    level: z.number().int(),
    atk: z.number().int(),
    def: z.number().int(),
    isNormal: flag,
    isEffect: flag,
    isFusion: flag,
    isRitual: flag,
    isFlip: flag,
    isSpirit: flag,
    isToon: flag,
    isUnion: flag,
  })
  .transform((raw): Card => ({
    kind: "monster",
    passcode: raw.ypdId,
    slug: raw.slug,
    name: raw.name,
    text: raw.goatText,
    banlist: raw.banlistStatus,
    attribute: lower(raw.attribute),
    race: raw.race,
    level: raw.level,
    atk: raw.atk,
    def: raw.def,
    subtypes: Object.entries(monsterFlags)
      .filter(([key]) => raw[key as keyof typeof monsterFlags] === true)
      .map(([, subtype]) => subtype),
  }));

const spell = z
  .object({
    ...cardBase,
    type: z.literal("Spell"),
    icon: z.enum(["Normal", "Continuous", "Equip", "Quick-Play", "Field", "Ritual"]),
  })
  .transform((raw): Card => ({
    kind: "spell",
    passcode: raw.ypdId,
    slug: raw.slug,
    name: raw.name,
    text: raw.goatText,
    banlist: raw.banlistStatus,
    icon: lower(raw.icon),
  }));

const trap = z
  .object({
    ...cardBase,
    type: z.literal("Trap"),
    icon: z.enum(["Normal", "Continuous", "Counter"]),
  })
  .transform((raw): Card => ({
    kind: "trap",
    passcode: raw.ypdId,
    slug: raw.slug,
    name: raw.name,
    text: raw.goatText,
    banlist: raw.banlistStatus,
    icon: lower(raw.icon),
  }));

const rulingTypes = {
  "Individual Card FAQs": "faq",
  "Netrep Rulings": "netrep-ruling",
  "Netrep Q&As": "netrep-qa",
} as const;

const ruling = z
  .object({
    id: z.uuid(),
    cardSlug: z.string().min(1),
    rulingType: z.enum(Object.keys(rulingTypes) as [keyof typeof rulingTypes]),
    ruling: z.string().min(1),
  })
  .transform((raw): SiteRuling => ({
    id: raw.id,
    cardSlug: raw.cardSlug,
    rulingType: rulingTypes[raw.rulingType],
    text: raw.ruling,
    sourceUrl: `${SITE_URL}/cards/${raw.cardSlug}#ruling-${raw.id}`,
  }));

function trpcPage<T extends z.ZodType>(item: T) {
  return z
    .object({
      result: z.object({
        data: z.object({
          json: z.object({ items: z.array(item), totalCount: z.number().int() }),
        }),
      }),
    })
    .transform((body) => body.result.data.json);
}

const cardsPage = trpcPage(z.union([monster, spell, trap]));
const rulingsPage = trpcPage(ruling);

type Procedures = {
  "card.listCards": { page: number; limit: number };
  "card.listRulings": { page: number; limit: number; cardName?: string };
};

export async function fetchCardsPage(page: number): Promise<Page<Card>> {
  const response = await getProcedure("card.listCards", { page, limit: PAGE_SIZE });
  return cardsPage.parse(await response.json());
}

export async function fetchRulingsPage(page: number, cardName?: string): Promise<Page<SiteRuling>> {
  const response = await getProcedure("card.listRulings", { page, limit: PAGE_SIZE, cardName });
  return rulingsPage.parse(await response.json());
}

export async function fetchSitePage(path: string): Promise<string> {
  const response = await get(new URL(path, SITE_URL));
  return response.text();
}

async function getProcedure<P extends keyof Procedures>(
  procedure: P,
  input: Procedures[P],
): Promise<Response> {
  const url = new URL(`/api/trpc/${procedure}`, SITE_URL);
  url.searchParams.set("input", JSON.stringify({ json: input }));
  return get(url);
}

async function get(url: URL): Promise<Response> {
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) {
    throw new Error(`${url.pathname} returned ${response.status} for ${url.search}`);
  }
  return response;
}

function lower<T extends string>(value: T): Lowercase<T> {
  return value.toLowerCase() as Lowercase<T>;
}
