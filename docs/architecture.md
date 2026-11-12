# Architecture

The target design for the chatbot. Most of it is not built yet; the repo today has `apps/web` and `packages/design-system`.

## Scope

The bot answers questions about playing Goat format, limited to the Goat card pool. It knows:

- Goat gameplay rules and mechanics from the rulebook
- Individual card rulings and ruling notices
- Goat-era card text, including the errata Goat uses
- Eventually everything else about playing Goat, but not tournament history

## Stack

| Layer                         | Choice                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Monorepo                      | pnpm, Turborepo, TypeScript 7, Node 24                                                  |
| Lint, format, unused code     | oxlint, oxfmt, knip                                                                     |
| Web app                       | React 19, Vite 8                                                                        |
| Routing                       | TanStack Router                                                                         |
| Server state                  | TanStack Query through Convex's React Query adapter                                     |
| UI                            | `packages/design-system`: Tailwind 4, Base UI, Remix icons                              |
| Chat components               | shadcn/ui AI Elements patterns, ported into the design system                           |
| Generative UI                 | Components rendered from typed tool parts                                               |
| Backend, database, API        | Convex                                                                                  |
| Validation                    | Convex validators; Zod for tool inputs                                                  |
| Agent runtime                 | Convex agent component, running in Convex actions                                       |
| Agent loop and message format | AI SDK                                                                                  |
| Model                         | DeepSeek V4.1 Flash via OpenRouter (`@openrouter/ai-sdk-provider`), pinned to a version |
| Retrieval                     | Agentic search over Convex full-text indexes                                            |
| Resumable streams             | Convex agent stream deltas, saved to the database                                       |
| Rate limiting                 | Convex rate limiter component                                                           |
| Ingestion                     | A Convex action that reads the site and upserts through internal mutations              |

## Layout

Packages split by concern, not by dataset.

| Path                     | Role                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| `apps/web`               | The chat UI, and the static demo on GitHub Pages                      |
| `packages/design-system` | Tokens, components, and chat components                               |
| `packages/backend`       | Convex: schema, queries, mutations, actions, agent, tools, and ingest |
| `packages/evals`         | Evals against the agent                                               |

The agent logic may move into its own package later, framed around agentic search rather than rulings.

## A chat turn

1. The browser sends the message through a Convex hook.
2. A Convex action runs the agent loop with the AI SDK.
3. The loop calls the model on OpenRouter over HTTP. OpenRouter forwards to the providers that run DeepSeek; nothing in this repo runs a model.
4. When the model calls a tool, the action runs it against Convex and feeds the result back, repeating until the model answers.
5. The action saves the reply as stream deltas. Every open client subscribes with `useUIMessages`, so a reload or a second tab picks up the stream where it is.

Convex is the agent runtime: it runs the loop, the tools, and the storage. OpenRouter is the model inference.

## Retrieval

Agentic search: the model decides what to look up, and looks again until it has enough. No RAG, no embeddings, no vector database.

- General tools, not rulings-shaped: `search` (full text, with optional filters by kind and by card) and `read` (one item, or a card with all its rulings).
- Rulings, rulebook sections, mechanics, and notices are stored as separate rows, each linked to the cards it mentions.
- Convex full-text search is BM25 with exact tokens and no typo tolerance, so card names are fuzzy-matched in our code against the card pool.

The tables are in [data.md](data.md).

## Generative UI

Tools return typed parts and the client renders a component per part type: card panel, ruling citation, chain and damage-step diagrams. Display tools pass validated data through; they add no servers. Card data is stored as structured fields so these components can render it.

## Data sources

- Card text, errata, card pool, banlist, rulings, ruling notices, and mechanics guides: read from [beta.goatformat.com](https://beta.goatformat.com)'s public API and pages. See [data.md](data.md).
- Rulebook: source to be decided. Until it lands, the agent has no full statement of the game rules (damage step, chains, timing). The guide sections summarize them, and the rest surfaces only as asides in rulings filed under other cards. Mechanics questions are the agent's biggest reliability gap. For example, Book of Moon in the damage step depends on a Skill Drain ruling that says only cards that specifically modify ATK or DEF can be activated there.

Goat uses the April 2005 card text and errata, so modern card databases are not a source for card text.

## Demo

The GitHub Pages build is static. It replays recorded threads stored as AI SDK UIMessage parts, with no backend and no model calls. Components never call Convex directly; they get data through our own hooks module, which the demo build swaps for the recorded threads.

## Running it

- Development: Convex runs locally with `npx convex dev`, no account needed.
- Self-hosting: the open-source Convex backend, configured through env vars.
- No auth for the MVP; it is a chatbot for local and self-hosted use.

## Decided against

| Option                      | Why not                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Hono, Drizzle, and Postgres | Resumable streams and live updates would be ours to build and host; Convex has them built in        |
| eve                         | Its own session store and streams would duplicate Convex's, splitting chat state across two systems |
| RAG and vector databases    | Agentic search over full-text indexes fits a small, keyword-heavy corpus                            |
| Calling model SDKs directly | OpenRouter gives every model behind one key                                                         |
| Redis for rate limiting     | The Convex rate limiter keeps self-hosting to one backend                                           |

## Open

- Evals tooling
- The rulebook source, the biggest reliability gap (see Data sources)
