# web

React 19 and Vite app on `@yugioh-rulings-chatbot/design-system`. Served under `/yugioh-rulings-chatbot/`, the GitHub Pages path.

## Run

```sh
pnpm dev                                  # WEB_DEV_URL in .dev/ports.env
pnpm build && pnpm --filter web preview   # WEB_PREVIEW_URL in .dev/ports.env
```

Each server takes the next free port when its default is busy and records its real URL in `.dev/ports.env`. Read the URL from there, never assume a port.

## Pages

- `index.html`: the app. A head script sets `.dark` on `html` from `prefers-color-scheme` before paint.
- `specimen.html`: every design-system component in both themes. Dev only; the build ships `index.html` alone. Open `<WEB_DEV_URL>specimen.html`.
