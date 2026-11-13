# web

React 19 and Vite app on `@goat-format-chatbot/design-system`. Served under `/goat-format-chatbot/`, the GitHub Pages path.

The app is the rulings chat: `/` asks a new question and `/threads/<id>` shows a thread with the agent's lookups and its cited answer. There is no header. A sidebar holds the name, a collapse button, a search over past question titles, New chat, and the past threads by last activity, grouped under Today, Yesterday, Previous 7 days, Previous 30 days, then by month, loading more as you scroll. Search results show as one Results group in match order. Each row has a … menu (on hover on desktop, always on mobile) to pin it to a Pinned group on top, rename it inline (Enter saves, Escape cancels), or delete it after a confirm, which goes to New chat when the open thread is deleted. Collapsed (or ⌘B) it is an icon rail, and the state survives a reload. Below 768px a slim bar opens it as a sheet. The demo build has no backend, so `/` is a demo home instead: it says what the demo is, links each recorded answer, and points to the repository for running the app. Its sidebar lists the recorded threads from `src/features/chat/data/demo-threads.json`, which open and search like live ones but have no … menu. Its thread pages keep the input disabled with a note saying so, and above it a note says the answer is recorded and what its lookups and sources show.

## Run

```sh
pnpm dev                                  # WEB_DEV_URL in .dev/ports.env
pnpm build && pnpm --filter web preview   # WEB_PREVIEW_URL in .dev/ports.env
pnpm --filter web dev:demo                # WEB_DEMO_URL in .dev/ports.env
```

`pnpm dev` runs the live app against the local Convex backend at `VITE_CONVEX_URL` (set in `.env.development`). `pnpm build` is the demo build that GitHub Pages serves (`vite build --mode demo`). It copies `index.html` to `404.html`, so Pages serves the app for deep links such as `/threads/<id>`. `dev:demo` serves the demo with hot reload, so demo changes show while you work.

Each server takes the next free port when its default is busy and records its real URL in `.dev/ports.env`. Read the URL from there, never assume a port.

## Demo threads

```sh
pnpm --filter web record
```

Asks each example question on the new-chat page against the local backend, waits for the answer, and writes the threads to `src/features/chat/data/demo-threads.json`. It then deletes those threads from the local backend. Run it with `pnpm dev` up and an OpenRouter key set, and commit the JSON. Each run makes real model calls.

## Pages

- `index.html`: the app. A head script sets `.dark` on `html` before paint, from the theme saved under `theme` in `localStorage` (`light` or `dark`) or, when none is saved, from `prefers-color-scheme`. It keeps following the OS and other tabs after load. The theme is picked in the user menu at the bottom of the sidebar.
- `specimen.html`: every design-system component in both themes. Dev only; the build ships `index.html` alone. Open `<WEB_DEV_URL>specimen.html`.
