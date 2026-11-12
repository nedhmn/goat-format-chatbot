Product-chrome glyph from Remix Icon (`@remixicon/react`). See readme.md > Iconography.

```jsx
import { RiFileCopyLine, RiSendPlane2Line } from '@remixicon/react';

<Icon icon={RiFileCopyLine} size={16} />
<Icon icon={RiSendPlane2Line} size={16} label="Send" />
```

Remix glyphs are filled shapes on a 24px grid, sized with `size` and coloured with `color` (default `currentColor`). There is no stroke width to set. Every glyph has a `Line` and a `Fill` variant: use `Line` by default and `Fill` only for an active or selected state (`RiSendPlane2Fill` once a message is sending). Inside `Button`, pass the Remix component as a child and let the button size the `svg`. In running text, prefer the unicode glyphs (`↓ → · ∧`) set in the surrounding font.
