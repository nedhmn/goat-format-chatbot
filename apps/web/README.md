# web

React 19 and Vite app on `@goat-format-chatbot/design-system`. Served under `/goat-format-chatbot/`, the GitHub Pages path.

The app is the rulings chat: `/` asks a new question and `/threads/<id>` shows a thread with the agent's lookups and its cited answer. There is no header. A sidebar holds the name, a collapse button, a search over past question titles, New chat, and the past threads by last activity, loading more as you scroll. Collapsed (or ⌘B) it is an icon rail, and the state survives a reload. Below 768px a slim bar opens it as a sheet. The demo build has no backend, so its input is disabled with a note saying so.

## Run

```sh
pnpm dev                                  # WEB_DEV_URL in .dev/ports.env
pnpm build && pnpm --filter web preview   # WEB_PREVIEW_URL in .dev/ports.env
```

`pnpm dev` runs the live app against the local Convex backend at `VITE_CONVEX_URL` (set in `.env.development`). `pnpm build` is the demo build that GitHub Pages serves (`vite build --mode demo`). It copies `index.html` to `404.html`, so Pages serves the app for deep links such as `/threads/<id>`.

Each server takes the next free port when its default is busy and records its real URL in `.dev/ports.env`. Read the URL from there, never assume a port.

## Pages

- `index.html`: the app. A head script sets `.dark` on `html` before paint, from the theme saved under `theme` in `localStorage` (`light` or `dark`) or, when none is saved, from `prefers-color-scheme`. It keeps following the OS and other tabs after load. The theme is picked in the user menu at the bottom of the sidebar.
- `specimen.html`: every design-system component in both themes. Dev only; the build ships `index.html` alone. Open `<WEB_DEV_URL>specimen.html`.
