# Brand

Reference for the design system of this repo, a Yu-Gi-Oh! Goat format chatbot. The product
surface is `apps/web`: a chat where a player asks a rulings question and the assistant
answers with the sources it used.

The source of truth for tokens and components is `packages/design-system`
(`src/styles.css` for the Tailwind 4 theme, `src/components/` for the TSX components on
Base UI). Build production UI with those imports. This folder is reference for voice,
layout, interaction rules, and components not yet ported. Never import from it.

The visual character is **warm paper, not white**. A near-black-olive ink on an off-white
oatmeal ground, one saturated orange accent, and near-flat surfaces separated by hairline
borders rather than shadows. It reads like a well-set technical journal.

---

## Content fundamentals

**Voice.** Declarative, plain, slightly formal. State what a thing is and stop. There is no
hype vocabulary ("revolutionary", "seamless", "10×"), no second-person coaching, and no
exclamation marks.

**Casing.** Sentence case for everything with a verb: headings, buttons, card titles,
descriptions. Title Case single words for navigation.

**Punctuation.** Headlines take a terminal period. Metadata is joined by a spaced middot:
`Aug 12, 2026 · Research`. Dates are always `MMM D, YYYY`. Breadcrumbs use a spaced slash:
`Rulings / Chain links`.

**Length.** A headline is one sentence. Card descriptions are one sentence, occasionally
two, and always concrete.

**Buttons.** Verb-first, sentence case, two to three words, sometimes carrying a trailing
unicode arrow: `Send →`, `Copy answer`, `New chat`.

**Assistant activity** is terse and past-tense-factual: `Thought 6s`,
`Searched Ash Blossom & Joyous Spring`. Times are abbreviated and relative: `now`, `10m`,
`45m`. The reply itself is plain prose in the same voice.

**Emoji: never.** Unicode arrows and a middot are the only non-alphanumeric characters used
decoratively.

---

## Visual foundations

### Colour

Two themes, both warm. Light is the default.

| role            | light               | dark                |
| --------------- | ------------------- | ------------------- |
| page background | `#f7f7f4` oatmeal   | `#14120b` warm soot |
| elevated / code | `#f2f1ed`           | `#1b1913`           |
| hover ground    | `#ebeae5`           | `#201e18`           |
| primary text    | `#26251e` olive ink | `#edecec`           |
| secondary text  | ink @ 60%           | inverse @ 60%       |
| border          | ink @ 10%           | inverse @ 10%       |

Neither theme uses a pure grey: every neutral is mixed toward olive/warm. The dark theme is
**not** an inversion of the light theme; it is a separate, softer palette.

One accent: **`#f54e00`** orange. It is also `--color-warning`. It appears in inline links
inside prose, counts, and code highlighting, never as a button fill. Semantics: success
`#1f8a65`, error `#cf2d56`, gold `#c08532`, and two blues (`#65afe0`, `#278dcc`) that appear
only inside product chrome. All semantic backgrounds are the hue at 15% (10%/25% for accent)
via `color-mix`, never a separately picked tint.

### Type

Two families.

- **The gothic** (Inter Tight): everything, including UI, navigation, headings, assistant
  replies and prose. Neo-grotesque, used almost entirely at weight 400; 700 shows up only on
  in-article `h2`.
- **The mono** (JetBrains Mono): code, commands, file paths, counts.

Sizes are not on a round grid; they are exact and should stay exact:
body 16/24 (`+0.08px` tracking), UI + list items 14/21 (`+0.14px`), code 13–14, card title
26/32.5 (`−0.325px`), section title 22/28.6 (`−0.11px`), page title 36/43.2 (`−0.72px`).
Tracking is negative above 20px and slightly positive below 17px.

Measure is generous: a `1240px` shell with a ~`77ch` text column.

### Space and layout

The scale is built on a **10px unit**, not 8px: 2.5 / 5 / 10 / 15 / 20 / 30.

### Surfaces, borders, radii

Cards are **flat**: a `--color-bg-elevated` fill, a 1px hairline border at 10% ink, and a
small radius (~6–10px). No drop shadow on any content card. The only shadowed elements are
floating ones: popovers and windows (`--shadow-popover`, `--shadow-window`).

Radii: 0 for nav items, 4–6px for chips and inputs, ~10px for cards, and `9999px` pills for
buttons. Buttons are _fully_ round-ended.

### Buttons

- **Primary**: ink fill `#26251e`, paper text, pill, `1px` border of the same ink.
- **Secondary**: `#ebeae5` fill, ink text, pill, no visible border.
- **Ghost / nav**: transparent fill, transparent 1px border (reserving the space), ink text,
  `5.6px 15px` padding, square corners.

Nav-scale padding is `5.6px 10.5px 5.88px`, asymmetric bottom padding to optically centre
the cap height. Keep it.

### Interaction

- **Hover**: ground change, not colour change. Ghost and list items swap background to
  `--color-bg-hover`. Links move from 60% ink to 100% ink. Filled buttons lighten ~8%.
- **Press**: darken the ground one step. No scale, no translate.
- **Focus**: 1px `--color-border-bright` ring plus the accent at 25% as an outer glow.
- **Transitions**: `0.14s` is the house duration (`--transition-fast`), on colour properties
  only. Ease is a standard cubic-bezier. There are **no** entrance animations, no parallax,
  no bounce, no spring. Motion in this brand is a hover state and nothing else.

### Transparency and blur

Used in one place: a fixed header that is translucent over scrolling content. Everything
else is opaque. There is no glassmorphism. Modal overlays dim with `bg-ink/75`, never blur.

---

## Iconography

Icons are **Remix Icon** via `@remixicon/react`, imported per glyph in `apps/web`. In order
of frequency:

1. **Unicode glyphs in text.** `↓`, `→`, `↑`, `·` (metadata separator), `∧`/`∨`
   (disclosure). These are set in the running text font at the surrounding size; treat them
   as typography, not as icons.
2. **Remix glyphs in product chrome**: send, copy, stop, close, disclosure chevrons, theme
   toggle. Examples: `RiSendPlane2Line`, `RiFileCopyLine`, `RiStopCircleLine`,
   `RiCloseLine`, `RiArrowDownSLine`, `RiSunLine` / `RiMoonLine`. Remix glyphs are filled
   shapes on a 24px grid, not strokes, so there is no stroke width to set. Size them with
   `size` (16px in chrome) and colour them with `currentColor`.
3. **No emoji, ever.**

Every Remix glyph has a `Line` and a `Fill` variant. Use `Line` by default; use `Fill` only
for an active or selected state. Inside `Button`, pass the Remix component as a child; the
button sizes any `svg`. `components/brand/Icon.jsx` is a reference wrapper with the brand
defaults.

---

## Fonts

The faces are free matches loaded from Google Fonts by the `@import` at the top of
`packages/design-system/src/styles.css`. There are no `@font-face` rules or local font files.

| face   | used for                  | loaded             |
| ------ | ------------------------- | ------------------ |
| gothic | UI, headings, body, prose | **Inter Tight**    |
| mono   | code, commands, paths     | **JetBrains Mono** |

`tokens/fonts.css` in this folder repeats the same import and stacks for the specimen cards.

---

## Index

**Root**

- `styles.css`: the entry point for the specimen cards. `@import` list only.
- `readme.md`: this file. `SKILL.md`: the skill wrapper.

**`tokens/`**: `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radius.css`,
`motion.css`, `base.css`. Plain CSS variables mirroring the theme in
`packages/design-system/src/styles.css`, which wins on any difference.

**`guidelines/`**: foundation specimen cards (Colors, Type, Spacing, Brand groups).

**Components** (reference `.jsx` plus a `.prompt.md` usage note each)

- `components/core/`: `Button`, `Badge`, `Avatar`, `Card`, `Input`, `Code`, and
  `core.card.html`, which fetches the `.jsx` files and so needs the skill folder served over
  http rather than opened from disk.
- `components/agent/`: `ToolCallLine`, one line of assistant activity.
- `components/brand/`: `Icon`, the Remix wrapper.

**UI kits**

- `ui_kits/desktop/Conversation.jsx`: a reference chat column with the prompt, assistant
  activity lines, the reply, and the composer.

### Notes on the primitive set

`packages/design-system` has the authoritative TSX version of `Button`, `Badge`, `Card`,
`Code` and `Input`, plus `Tooltip`. `Avatar`, `ToolCallLine` and `Conversation` are not
ported yet; port them on Base UI with Tailwind classes from the theme before using them in
`apps/web`.
