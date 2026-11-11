Pill-shaped action button: use for every call to action and primary action in the app.

```jsx
<Button variant="primary" size="lg" >Ask a ruling</Button>
<Button variant="secondary" size="lg" trailing="→">Request a demo</Button>
<Button variant="outline">Browse cards</Button>
<Button variant="ghost">Models</Button>
```

Variants: `primary` (ink fill, paper text), `secondary` (paper-3 fill), `outline` (hairline pill, used for "Contact sales"), `ghost` (transparent, square corners, nav items only). Sizes `sm|md|lg`; `sm` is the nav scale. Trailing arrows are unicode glyphs, not icons. Never fill a button with `--color-accent`.
