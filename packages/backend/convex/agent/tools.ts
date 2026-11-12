import { createTool } from "@convex-dev/agent";
import { z } from "zod";

import { internal } from "../_generated/api";
import type { CardReading, PassageSearch } from "../lookup";
import type { CardMatch } from "./cardNames";

export const findCard = createTool({
  description:
    "Look up Goat Format cards by name. Forgives case, punctuation, plurals, a one-letter typo, and partial names. Returns how it matched and up to 10 cards with their exact names. Call it before reading a card the user named.",
  inputSchema: z.object({ name: z.string().describe("The card name as the user wrote it") }),
  execute: (ctx, { name }): Promise<CardMatch> => ctx.runQuery(internal.lookup.findCards, { name }),
});

export const read = createTool({
  description:
    "Read one card by its exact name, as findCard returns it: its text and banlist status, the rulings filed under it, and every ruling, ruling notice, and guide section that names it. Each passage has its source URL.",
  inputSchema: z.object({ card: z.string().describe("The exact card name") }),
  execute: (ctx, { card }): Promise<CardReading> =>
    ctx.runQuery(internal.lookup.readCard, { name: card }),
});

export const search = createTool({
  description:
    "Full-text search over rulings, ruling notices (official rulings that override older ones), and mechanic guide sections, for questions about game mechanics or when read does not answer. Returns up to 8 passages, best match first, each with its source URL.",
  inputSchema: z.object({
    query: z.string().describe("Words the passage would contain, such as 'damage step flip'"),
    kind: z
      .enum(["ruling", "notice", "mechanic"])
      .optional()
      .describe("Only passages of this kind"),
    card: z.string().optional().describe("Only rulings filed under this exact card name"),
  }),
  execute: (ctx, args): Promise<PassageSearch> =>
    ctx.runQuery(internal.lookup.searchPassages, args),
});

export const tools = { findCard, read, search };
