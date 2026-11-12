---
name: verify-web
description: Launch, drive, and capture evidence from the app locally. Use before claiming any change works, when a PR needs evidence, or when asked to check a page.
---

# verify-web

## Ports

Ports are not fixed: other projects run on this machine. Every local server binds `127.0.0.1`, moves to the next free port when its default is busy, and records the URL it actually got in `.dev/ports.env` (gitignored) once it is listening. The entry is removed when the server stops. A new server follows the same contract; `apps/web/vite.config.ts` is the reference.

Never assume a port. Read the file, then confirm the URL answers before driving it:

```sh
cat .dev/ports.env
curl -s -o /dev/null -w '%{http_code}\n' "$(sed -n 's/^WEB_DEV_URL=//p' .dev/ports.env)"
```

Something answering on `localhost:5173` may be another project.

## Local

```sh
pnpm dev                     # WEB_DEV_URL, Convex on http://127.0.0.1:3210
```

Start it in the background and read the log until `WEB_DEV_URL` is in `.dev/ports.env` and Convex prints "Convex functions ready". Stop it with SIGINT to the native `turbo` binary (`pgrep -f darwin-arm64/bin/turbo`), not its node wrapper, so the Convex backend shuts down with it; never `pkill -f`. The first run downloads the Convex local backend binary.

## Demo build

For anything the dev server can hide (the Pages base path `/goat-format-chatbot/`, asset URLs, the built bundle), serve the production build:

```sh
pnpm build && pnpm --filter web preview      # WEB_PREVIEW_URL
```

## Drive

Harness browser tools when available: open the page, snapshot, click by role or text, screenshot. Otherwise Playwright. Check both themes and reduced motion for anything visual.

## Evidence

Screenshots and output go to `.evidence/<name>.png`, gitignored, and are listed in the PR's Evidence section with what each proves. Fixes get before and after.
