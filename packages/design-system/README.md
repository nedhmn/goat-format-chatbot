# @goat-format-chatbot/design-system

Tokens, Tailwind 4 theme and React components for `apps/web`. Ported from the nedhermann design system, on Base UI instead of Radix. Shipped as source; the consuming app's Vite and Tailwind build it.

## Use

```css
@import "@goat-format-chatbot/design-system/styles.css";
```

```tsx
import { Button } from "@goat-format-chatbot/design-system/components/button";
```

- `styles.css` imports Tailwind, the typography plugin and the fonts, and scans `apps/**` for classes. It replaces Tailwind's default palette and type scale with the brand's, so classes like `bg-white` or `text-4xl` do not exist; use the tokens (`bg-bg`, `text-text-primary`, ...).
- Dark mode is the `.dark` class on an ancestor, usually `html`. It is a separate warm palette, not an inversion of light.
- `.prose` styles rendered markdown with a sans body. Its colors come from the semantic tokens, so dark mode needs no `prose-invert`. It is unlayered on purpose: the typography plugin emits its defaults in the utilities layer, which outranks `@layer components`, so only unlayered rules reliably win.
- Components take a Base UI `render` prop where they can be another element, for example `<Button render={<a href="/" />}>`.
- Icons come from `@remixicon/react` in the app; `Button` sizes any `svg` child.

## Components

`badge`, `button`, `card`, `code`, `input`, `tooltip`, and `cn` in `lib/utils`.

Chat, for the rulings chat:

- `conversation`: a scrolling log that sticks to the bottom while a reply streams, with a "Jump to latest" button once you scroll up.
- `message`: a user or assistant message. `MessageMarkdown` renders Markdown with GFM into `.prose` and opens links in a new tab. Pass `streaming` while the text is still arriving, so an unclosed `**` or backtick does not flash as raw text.
- `prompt-input`: a form with an auto-growing textarea. Enter submits, Shift+Enter adds a line, and nothing submits while the submit button is disabled.
- `tool-call`: one line per agent tool call, with a running, done, or failed badge.

`conversation`, `message`, and `prompt-input` are adapted from [AI Elements](https://github.com/vercel/ai-elements) (Apache-2.0); see the root `LICENSE`.
