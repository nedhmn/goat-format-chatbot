# web

React 19 and Vite app on `@goat-format-chatbot/design-system`. Served under `/goat-format-chatbot/`, the GitHub Pages path.

The app is the rulings chat: `/` asks a new question and `/threads/<id>` shows a thread with the agent's lookups and its cited answer. The demo build has no backend, so its input is disabled with a note saying so.

## Run

```sh
pnpm dev                                  # WEB_DEV_URL in .dev/ports.env
pnpm build && pnpm --filter web preview   # WEB_PREVIEW_URL in .dev/ports.env
```

`pnpm dev` runs the live app against the local Convex backend at `VITE_CONVEX_URL` (set in `.env.development`). `pnpm build` is the demo build that GitHub Pages serves (`vite build --mode demo`). It copies `index.html` to `404.html`, so Pages serves the app for deep links such as `/threads/<id>`.

Each server takes the next free port when its default is busy and records its real URL in `.dev/ports.env`. Read the URL from there, never assume a port.

## Pages

- `index.html`: the app. A head script sets `.dark` on `html` from `prefers-color-scheme` before paint.
- `specimen.html`: every design-system component in both themes. Dev only; the build ships `index.html` alone. Open `<WEB_DEV_URL>specimen.html`.
