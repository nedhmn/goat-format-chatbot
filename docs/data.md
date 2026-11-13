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

| `kind`     | Fields                                      | One row per                          |
| ---------- | ------------------------------------------- | ------------------------------------ |
| `ruling`   | `cardId`, `rulingType`, `text`, `sourceUrl` | ruling on a card                     |
| `notice`   | `title`, `text`, `sourceUrl`                | section of a ruling notice article   |
| `mechanic` | `title`, `text`, `sourceUrl`                | section of a gameplay `/learn` guide |

`rulingType` is `faq`, `netrep-ruling`, or `netrep-qa`. `sourceUrl` links to the passage on the site and is the key for upserts.

The `search_text` index searches `text` and filters by `kind` and `cardId`. Convex full-text search matches exact tokens with no typo tolerance, so card names are matched against the card pool in code before searching.

### `passageCards`

Links each passage to the cards it involves, so a lookup by card finds the rulings filed under it and the rulings, notices, and guide sections that only mention it. A ruling filed under 3-Hump Lacooda that names Ring of Destruction is found from either card.

| Field       | Meaning                                                      |
| ----------- | ------------------------------------------------------------ |
| `passageId` | The passage                                                  |
| `cardId`    | A card it involves                                           |
| `role`      | `owner` for the card a ruling is filed under, else `mention` |

`by_card` looks up a card's links by role and `by_passage` a passage's links. `cards.passagesForCard` returns a card's owned and mentioned passages.

Mentions come from quoted strings in the text, since the rulings quote card names. Each is matched against the card pool on a key that ignores case, spacing, punctuation, and a trailing `(s)` or possessive. A key of 8 or more characters with no exact match takes the one card within a single edit, which catches plurals and typos such as "Gradius's Option" and "Magicial Scientist". Names outside quotes are not matched, because short card names such as "Reload" and "Forest" are also ordinary words. Nicknames such as "Peten" and quoted terms such as "destroyed" stay unmatched, and the ingest lists the most frequent ones.

### `threads`

One row per chat thread, next to the agent component's own thread, so the sidebar can sort, search, and later pin threads. `send` writes it.

| Field      | Meaning                                   |
| ---------- | ----------------------------------------- |
| `threadId` | The agent component's thread              |
| `userId`   | The thread's owner                        |
| `title`    | The first question, cut to 80 characters  |
| `activeAt` | When the last question was asked          |
| `pinnedAt` | When it was pinned, absent when it is not |

`by_thread` finds a thread's row. `by_user_pinned_active` lists a user's unpinned threads by `activeAt`. `search_title` searches titles, filtered by `userId`. Threads from before the table existed are added by `chat.backfillThreads`.

## Ingest

Load or refresh everything while the backend runs (`pnpm dev`):

```sh
pnpm --filter @goat-format-chatbot/backend ingest
```

It runs `ingest:run`, an internal action in `packages/backend/convex/ingest.ts` whose logic lives in `packages/backend/convex/model/ingest/`:

- Fetches every page of cards and rulings from the site's API, then every ruling notice (`/articles/ruling-notice-*`) and the two gameplay guides (`/learn/rulings`, `/learn/goat-format-history`) listed in the site's sitemap, one request a second. The other `/learn` pages cover accounts, deckbuilding, and tournaments, so they are left out. Each response is parsed where it is fetched.
- Splits each article at its `h2` headings that carry an id. Each section links to that heading, and text before the first heading links to the page. Card widgets inside the article are skipped. The text is written as Markdown: lists, quotes, sub-headings, bold, and italics keep their markup, links keep only their text, and curly quotes are straightened.
- Upserts cards by `passcode` and passages by `sourceUrl`, in batches of 100, rewriting only rows that changed.
- Links every passage to the cards it involves, adding and removing only the links that changed.
- Deletes cards and passages the site no longer lists. Deleting a card deletes its rulings, and deleting either deletes its links.
- Prints how many rows it inserted, updated, left unchanged, and deleted, and the quoted strings it could not match to a card. A second run with no site changes reports every row unchanged.

The site sorts rulings by card name, which ties within a card, so paging can repeat or skip a ruling where a card's rulings cross a page boundary. The ingest refetches those cards by name and dedupes by ruling id, then fails if the card or ruling count differs from the total the site reports.
