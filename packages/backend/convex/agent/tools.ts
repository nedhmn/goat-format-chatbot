import { createTool } from "@convex-dev/agent";
import { z } from "zod";

import { internal } from "../_generated/api";
import type { CardMatch } from "./cardNames";

export const findCard = createTool({
  description:
    "Look up Goat Format cards by name. Forgives case, punctuation, plurals, a one-letter typo, and partial names. Returns how it matched and up to 10 cards with their exact names. Call it before reading a card the user named.",
  inputSchema: z.object({ name: z.string().describe("The card name as the user wrote it") }),
  execute: (ctx, { name }): Promise<CardMatch> => ctx.runQuery(internal.lookup.findCards, { name }),
});

export const tools = { findCard };
