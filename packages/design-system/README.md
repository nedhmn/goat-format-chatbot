# @goat-format-chatbot/design-system

Tokens, Tailwind 4 theme and React components for `apps/web`. Ported from the nedhermann design system, on Base UI instead of Radix. Shipped as source; the consuming app's Vite and Tailwind build it.

## Use

```css
@import "@goat-format-chatbot/design-system/styles.css";
```

```tsx
import { Button } from "@goat-format-chatbot/design-system/components/button";
```

- `styles.css` imports Tailwind, shadcn's utilities (`shadcn/tailwind.css`, `tw-animate-css`), the typography plugin and the fonts, and scans `apps/**` and Streamdown for classes. It replaces Tailwind's default palette and type scale with the brand's, so classes like `bg-white` or `text-4xl` do not exist; use the tokens (`bg-bg`, `text-text-primary`, ...).
- Dark mode is the `.dark` class on an ancestor, usually `html`. It is a separate warm palette, not an inversion of light.
- `.prose` styles rendered markdown with a sans body. Its colors come from the semantic tokens, so dark mode needs no `prose-invert`. It is unlayered on purpose: the typography plugin emits its defaults in the utilities layer, which outranks `@layer components`, so only unlayered rules reliably win.
- Components take a Base UI `render` prop where they can be another element, for example `<Button render={<a href="/" />}>`.
- Icons come from `@remixicon/react` in the app; `Button` sizes any `svg` child.

## Components

`badge`, `button`, `card`, `code`, `input`, `sidebar`, `tooltip`, and `cn` in `lib/utils`.

`sidebar` is the app shell, ported from shadcn's sidebar and cut down to one layout: a 240px column that collapses to a 64px icon rail, with the page in a bordered sheet beside it. Collapsing keeps icons in place and fades labels on the standard transition, so reduced motion is instant. `SidebarSwap` holds an expanded and a collapsed control in the same 36px slot and cross-fades between them. `SidebarFooter` pins content to the bottom of the column. `SidebarMenuAction` is a small button at the right of a menu row, hidden until hover or focus on desktop with `showOnHover`, and the row's label leaves room for it. On mobile it opens as a sheet from `SidebarTrigger`.

Chat, for the rulings chat, follows the [shadcn AI Elements](https://ui.shadcn.com/docs/ai-elements) patterns:

- `ui/*` are shadcn/ui components added with the shadcn CLI (`components.json`, style `base-rhea`) and not edited by hand beyond formatting: `message-scroller`, `message`, `bubble`, `trace`, `input-group`, `code-block`, `hover-card`, `collapsible`, `dropdown-menu`, `avatar`, `alert-dialog`, and the `button`, `badge`, `input`, `textarea`, `sheet`, `skeleton`, `tooltip`, and `hooks/use-mobile` they build on. Add more with `pnpm dlx shadcn@<version> add <name>` from this package. Restyle them through the theme, not by editing them.
- The theme maps shadcn's variables (`--background`, `--primary`, `--muted`, `--accent`, `--ring`, `--sidebar*`, ...) onto the brand tokens in `styles.css`. shadcn's `accent` is a hover fill, so the brand orange is `brand` (`bg-brand`, `text-brand`).
- `markdown`: `Markdown` renders a reply with Streamdown and routes fenced code to `code-block`. Pass `streaming` while the text is still arriving, so an unclosed `**` or fence does not flash as raw text.

The files under `src/components/ui`, plus `sidebar.tsx`, `use-highlighted-code.ts`, and `highlighter.tsx`, come from [shadcn/ui](https://github.com/shadcn-ui/ui): Copyright (c) 2023 shadcn, [MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).
