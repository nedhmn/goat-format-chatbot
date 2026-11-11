# @yugioh-rulings-chatbot/design-system

Tokens, Tailwind 4 theme and React components for `apps/web`. Ported from the nedhermann design system, on Base UI instead of Radix. Shipped as source; the consuming app's Vite and Tailwind build it.

## Use

```css
@import "@yugioh-rulings-chatbot/design-system/styles.css";
```

```tsx
import { Button } from "@yugioh-rulings-chatbot/design-system/components/button";
```

- `styles.css` imports Tailwind, the typography plugin and the fonts, and scans `apps/**` for classes. It replaces Tailwind's default palette and type scale with the brand's, so classes like `bg-white` or `text-4xl` do not exist; use the tokens (`bg-bg`, `text-text-primary`, ...).
- Dark mode is the `.dark` class on an ancestor, usually `html`.
- Components take a Base UI `render` prop where they can be another element, for example `<Button render={<a href="/" />}>`.
- Icons come from `@remixicon/react` in the app; `Button` sizes any `svg` child.

## Components

`badge`, `button`, `card`, `code`, `input`, `tooltip`, and `cn` in `lib/utils`.
