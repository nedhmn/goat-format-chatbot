---
name: brand
description: Brand reference for the Goat Format Chatbot design system, covering voice, colour, type, spacing, interaction rules, and reference components. Load when designing or changing UI in apps/web or packages/design-system. Production code imports from packages/design-system, never from this folder.
user-invocable: true
---

Load this skill before designing or changing UI in `apps/web` or `packages/design-system`. Read `readme.md` first, then the files it indexes as needed.

Layout: `styles.css` (entry, imports `tokens/`) · `components/{core,agent,brand}/` (reference `.jsx` plus a `.prompt.md` usage note per component) · `ui_kits/desktop/Conversation.jsx` (chat column reference) · `guidelines/` (specimen cards).

`packages/design-system` is the source of truth: its `src/styles.css` holds the Tailwind 4 theme and fonts, and `src/components/` holds the TSX components on Base UI. Icons are Remix (`@remixicon/react`). Build production UI with those imports and use this skill for voice, layout, interaction rules, and any component not yet ported. Never import from this folder.
