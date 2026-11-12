# Getting started

Node 24 and pnpm.

## Run it

```sh
pnpm install
cp packages/backend/.env.example packages/backend/.env
pnpm dev
```

This starts the web app and a local Convex backend on `http://127.0.0.1:3210`, no Convex account needed. The first run downloads the backend binary. The web app's URL is in `.dev/ports.env`.

Fill in `OPENROUTER_API_KEY` in `packages/backend/.env` with a key from [openrouter.ai/keys](https://openrouter.ai/keys). `pnpm dev` loads it into the local backend. Without it everything runs, and asking a question says how to set the key.

Open the web app and ask a question. The answer streams into a thread at `/threads/<id>`, which survives a reload.

<!-- One worked session, start to finish. Nothing about checks or tooling; that is CONTRIBUTING.md. -->
