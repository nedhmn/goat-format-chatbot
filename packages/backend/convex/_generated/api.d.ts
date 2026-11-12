/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent_agent from "../agent/agent.js";
import type * as agent_cardNames from "../agent/cardNames.js";
import type * as agent_instructions from "../agent/instructions.js";
import type * as agent_tools from "../agent/tools.js";
import type * as chat from "../chat.js";
import type * as ingest_goatformat from "../ingest/goatformat.js";
import type * as ingest_mentions from "../ingest/mentions.js";
import type * as ingest_pages from "../ingest/pages.js";
import type * as ingest_paging from "../ingest/paging.js";
import type * as ingest_store from "../ingest/store.js";
import type * as ingest_sync from "../ingest/sync.js";
import type * as limits from "../limits.js";
import type * as lookup from "../lookup.js";
import type * as smoke from "../smoke.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agent/agent": typeof agent_agent;
  "agent/cardNames": typeof agent_cardNames;
  "agent/instructions": typeof agent_instructions;
  "agent/tools": typeof agent_tools;
  chat: typeof chat;
  "ingest/goatformat": typeof ingest_goatformat;
  "ingest/mentions": typeof ingest_mentions;
  "ingest/pages": typeof ingest_pages;
  "ingest/paging": typeof ingest_paging;
  "ingest/store": typeof ingest_store;
  "ingest/sync": typeof ingest_sync;
  limits: typeof limits;
  lookup: typeof lookup;
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
