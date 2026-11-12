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

`badge`, `button`, `card`, `code`, `input`, `tooltip`, and `cn` in `lib/utils`.

Chat, for the rulings chat, follows the [shadcn AI Elements](https://ui.shadcn.com/docs/ai-elements) patterns:

- `ui/*` are shadcn/ui components added with the shadcn CLI (`components.json`, style `base-rhea`) and not edited by hand beyond formatting: `message-scroller`, `message`, `bubble`, `trace`, `input-group`, `code-block`, `hover-card`, `collapsible`, `sidebar`, and the `button`, `badge`, `input`, `textarea`, `sheet`, `separator`, `skeleton`, `tooltip`, and `hooks/use-mobile` they build on. Add more with `pnpm dlx shadcn@<version> add <name>` from this package. Restyle them through the theme, not by editing them.
- The theme maps shadcn's variables (`--background`, `--primary`, `--muted`, `--accent`, `--ring`, `--sidebar*`, ...) onto the brand tokens in `styles.css`. shadcn's `accent` is a hover fill, so the brand orange is `brand` (`bg-brand`, `text-brand`).
- `markdown`: `Markdown` renders a reply with Streamdown and routes fenced code to `code-block`. Pass `streaming` while the text is still arriving, so an unclosed `**` or fence does not flash as raw text.

The shadcn/ui files are MIT; see the root `LICENSE`.
