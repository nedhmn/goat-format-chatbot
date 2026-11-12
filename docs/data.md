# Data

What the backend stores and where it comes from. The schema is `packages/backend/convex/schema.ts`.

## Source

Everything comes from [beta.goatformat.com](https://beta.goatformat.com), through what any visitor can reach: its public API for cards and rulings, and its pages for ruling notices and mechanics guides. Running the ingest needs no account and no knowledge of how the site is built.

- Card text is Goat format text: the wording and errata in effect for the April 2005 TCG. The site sources it from Yugipedia's errata history.
- The banlist is the April 2005 TCG list, stored as a status on each card.
- Rulings come from the site's rulings database, each filed under one card. A ruling's text often names other cards that it is not filed under.

## Tables

### `cards`

One row per card in the Goat card pool.

| Field                 | Meaning                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `passcode`            | The number printed on the card. YGOPRODeck uses it as its card id. The key for upserts. |
| `slug`, `name`        | The site's URL slug and the card name                                                   |
| `text`                | Goat format card text                                                                   |
| `banlist`             | `forbidden`, `limited`, `semi-limited`, or `unlimited`                                  |
| `kind`                | `monster`, `spell`, or `trap`; each kind has its own fields                             |
| monster fields        | `attribute`, `race`, `level`, `atk`, `def`, `subtypes` (such as `effect`, `flip`)       |
| spell and trap fields | `icon` (such as `quick-play`, `continuous`, `counter`)                                  |

Card images are not stored. Build an image URL from a base URL and the passcode, such as `https://images.ygoprodeck.com/images/cards/{passcode}.jpg`, so any mirror of YGOPRODeck's images works.

### `passages`

Every piece of text the agent searches, in one table so one search index ranks them together. `kind` decides the other fields.

| `kind`     | Fields                                      | One row per                        |
| ---------- | ------------------------------------------- | ---------------------------------- |
| `ruling`   | `cardId`, `rulingType`, `text`, `sourceUrl` | ruling on a card                   |
| `notice`   | `title`, `text`, `sourceUrl`                | section of a ruling notice article |
| `mechanic` | `title`, `text`, `sourceUrl`                | section of a `/learn` guide        |

`rulingType` is `faq`, `netrep-ruling`, or `netrep-qa`. `sourceUrl` links to the passage on the site and is the key for upserts.

The `search_text` index searches `text` and filters by `kind` and `cardId`. Convex full-text search matches exact tokens with no typo tolerance, so card names are matched against the card pool in code before searching.

## Ingest

Load or refresh everything while the backend runs (`pnpm dev`):

```sh
pnpm --filter @goat-format-chatbot/backend ingest
```

It runs `ingest/sync:run`, an internal action in `packages/backend/convex/ingest/`:

- Fetches every page of cards and rulings from the site's API, then every ruling notice (`/articles/ruling-notice-*`) and `/learn` page listed in the site's sitemap, one request a second. Each response is parsed where it is fetched.
- Splits each article at its `h2` headings that carry an id. Each section links to that heading, and text before the first heading links to the page. Card widgets inside the article are skipped.
- Upserts cards by `passcode` and passages by `sourceUrl`, in batches of 100, rewriting only rows that changed.
- Deletes cards and passages the site no longer lists. Deleting a card deletes its rulings.
- Prints how many rows it inserted, updated, left unchanged, and deleted. A second run with no site changes reports every row unchanged.

The site sorts rulings by card name, which ties within a card, so paging can repeat or skip a ruling where a card's rulings cross a page boundary. The ingest refetches those cards by name and dedupes by ruling id, then fails if the card or ruling count differs from the total the site reports.
