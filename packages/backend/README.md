# backend

Convex: schema, queries, mutations, and actions for the chatbot, and the agent that answers rulings questions. The agent finds the cards named, reads their rulings and the passages that name them, searches when that does not settle it, and answers only from what it found, with a source link for each passage. It asks back when a name is ambiguous or shorthand, and says so when the data does not cover a question. See [docs/architecture.md](../../docs/architecture.md).

## Layout

- `convex/schema.ts`: the `cards` and `passages` tables and their validators. See [docs/data.md](../../docs/data.md).
- `convex/convex.config.ts`: registers the agent component and declares the deployment's env vars.
- `convex/model/`: the logic behind the functions, as plain functions over the Convex ctx. The function files below are thin wrappers that validate args and call into it.
- `convex/model/agent/`: the agent, on DeepSeek V4.1 Flash through OpenRouter with the model id pinned in `agent.ts`, its instructions, its tools, and `answer.ts`, which streams a reply into a thread or returns a whole answer. `findCard` resolves a loosely typed card name to exact names: exact, then a one-letter typo for names of 8 or more characters, then partial names. It returns up to 10 candidates and never expands shorthand such as BLS. `read` returns a card by exact name, with its rulings and every passage that names it. `search` runs a full-text search over passages, narrowed by kind or by owning card, and returns up to 8. The agent stops after 8 steps, and the last step has no tools, so it always answers.
- `convex/cards.ts`: the internal queries the tools call.
- `convex/model/ingest/`: loads cards, rulings, ruling notices, and the gameplay `/learn` pages from beta.goatformat.com. `goatformat.ts` and `pages.ts` fetch and parse the site, `paging.ts` pages through the API, `mentions.ts` matches quoted card names, `store.ts` writes rows, and `sync.ts` runs the whole load.
- `convex/ingest.ts`: the ingest functions. `run` (internal action) loads everything; `pnpm --filter @goat-format-chatbot/backend ingest` runs it against the running backend. The internal mutations `upsertCards`, `upsertRulings`, `upsertSections`, `deleteStaleCards`, `deleteStalePassages`, and `syncCardLinks` are the writes it batches.
- `convex/agent.ts`: the internal actions that run the agent: `reply` and `ask`.
  - `ask` (internal action): answers a question and returns the whole text at once. `smoke` and the CLI use it.
- `convex/smoke.ts`: five smoke questions through the live agent. `pnpm --filter @goat-format-chatbot/backend smoke` runs them against the running backend on your OpenRouter key (a few cents) and prints each answer.
- `convex/chat.ts`: the public chat API.
  - `send` (mutation): saves a question in a new thread titled from the question (cut to 80 characters), or continues the thread given by `threadId`, and schedules `reply`, which streams the answer into the thread as stream deltas. It fails at once with the setup message when the OpenRouter key is missing, and with "Too many questions. Try again in ..." past the limits in `convex/model/limits.ts` (10 a minute, 200 a day, for the one viewer until there is auth). Both errors are `ConvexError`s whose `data` is the message to show.
  - `messages` (query): a page of the thread's messages as AI SDK UI messages, plus any reply still streaming. Built for `useUIMessages` from `@convex-dev/agent/react`.
  - `threads` (query): a page of the viewer's unpinned threads, most recently active first, as `{ threadId, title, activeAt }`. Built for `usePaginatedQuery`.
  - `thread` (query): one of the viewer's threads with its title, or null when it is missing or someone else's.
  - `searchThreads` (query): up to 20 of the viewer's threads whose title matches `query`, best match first. An empty query returns none.
  - `pinnedThreads` (query): up to 50 of the viewer's pinned threads, latest pin first.
  - `pin` (mutation): pins a thread when `pinned` is true, which moves it out of `threads` into `pinnedThreads`, and unpins it otherwise.
  - `rename` (mutation): retitles a thread, here and on the agent thread, tidied and cut like a first question. A blank title fails with a `ConvexError`.
  - `remove` (mutation): deletes the thread for good: its row at once, then the agent thread with its messages and streams in scheduled batches.
  - `pin`, `rename`, and `remove` fail with "This thread no longer exists." for an unknown thread and with "This thread belongs to someone else." for another viewer's.
  - `backfillThreads` (internal mutation): adds a `threads` row for each of the viewer's agent threads that has none, active at its last message, in batches of 50. Run it once on an existing deployment: `pnpm exec convex run chat:backfillThreads '{"cursor":null}'`.
  - There is no auth. One `viewer` helper in `convex/model/chat.ts` returns the fixed user `owner`, so every thread `send` starts belongs to it, and `send`, `messages`, and `threads` check against it. Threads made before this have no user and no longer open. Adding auth means filling in that helper; the rate limit is already keyed by its user. `ask` starts threads with no user.
- `test/`: vitest, with convex-test for functions.
- `convex/_generated`: generated by the Convex CLI and committed, so the gate typechecks without a running backend. Never edit by hand.

## Run

Local only, no Convex account needed. `pnpm dev` at the root runs it alongside the web app, or alone:

```sh
pnpm --filter @goat-format-chatbot/backend dev
```

The backend answers on `http://127.0.0.1:3210` and listens on all interfaces. The CLI keeps local state in `.convex/` and writes `CONVEX_URL` to `.env.local`, both gitignored.

The agent needs an OpenRouter key. Convex functions read env vars from the deployment, not from files, so `dev` first runs `env:sync`, which copies `.env` onto the local deployment with `convex env set --from-file`. Without a `.env` it skips the step, and everything but the agent works. After editing `.env` while the backend runs, run `pnpm --filter @goat-format-chatbot/backend env:sync`.

Ask a question from the CLI:

```sh
cd packages/backend
CONVEX_AGENT_MODE=anonymous pnpm exec convex run agent:ask '{"question": "Can I chain Book of Moon in the damage step?"}'
```
