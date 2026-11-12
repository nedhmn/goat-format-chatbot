/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent from "../agent.js";
import type * as cards from "../cards.js";
import type * as chat from "../chat.js";
import type * as ingest from "../ingest.js";
import type * as model_agent_agent from "../model/agent/agent.js";
import type * as model_agent_answer from "../model/agent/answer.js";
import type * as model_agent_cardNames from "../model/agent/cardNames.js";
import type * as model_agent_instructions from "../model/agent/instructions.js";
import type * as model_agent_tools from "../model/agent/tools.js";
import type * as model_cards from "../model/cards.js";
import type * as model_chat from "../model/chat.js";
import type * as model_ingest_goatformat from "../model/ingest/goatformat.js";
import type * as model_ingest_mentions from "../model/ingest/mentions.js";
import type * as model_ingest_pages from "../model/ingest/pages.js";
import type * as model_ingest_paging from "../model/ingest/paging.js";
import type * as model_ingest_store from "../model/ingest/store.js";
import type * as model_ingest_sync from "../model/ingest/sync.js";
import type * as model_limits from "../model/limits.js";
import type * as smoke from "../smoke.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  cards: typeof cards;
  chat: typeof chat;
  ingest: typeof ingest;
  "model/agent/agent": typeof model_agent_agent;
  "model/agent/answer": typeof model_agent_answer;
  "model/agent/cardNames": typeof model_agent_cardNames;
  "model/agent/instructions": typeof model_agent_instructions;
  "model/agent/tools": typeof model_agent_tools;
  "model/cards": typeof model_cards;
  "model/chat": typeof model_chat;
  "model/ingest/goatformat": typeof model_ingest_goatformat;
  "model/ingest/mentions": typeof model_ingest_mentions;
  "model/ingest/pages": typeof model_ingest_pages;
  "model/ingest/paging": typeof model_ingest_paging;
  "model/ingest/store": typeof model_ingest_store;
  "model/ingest/sync": typeof model_ingest_sync;
  "model/limits": typeof model_limits;
  smoke: typeof smoke;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
