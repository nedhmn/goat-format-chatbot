<h1 align="center">Yu-Gi-Oh! Rulings Chatbot</h1>

<p align="center"><strong>An AI chatbot that answers Goat format Yu-Gi-Oh! rulings questions</strong></p>

<p align="center">
  <a href="https://nedhmn.github.io/yugioh-rulings-chatbot"><strong>Demo</strong></a> ·
  <a href="./docs/getting-started.md"><strong>Getting started</strong></a> ·
  <a href="./CONTRIBUTING.md"><strong>Contributing</strong></a>
</p>

<p align="center">
  <img alt="MIT" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="CI" src="https://github.com/nedhmn/yugioh-rulings-chatbot/actions/workflows/ci.yml/badge.svg">
</p>

<!-- One screenshot or diagram of the example app here. -->

## What this is

A chatbot for Goat format: the Goat card pool, its gameplay rules, card rulings, and the Goat-era card text with errata. It answers with agentic search, looking up rulings, cards, and rules through tools until it has enough to answer, and shows cards and citations as components in the chat.

The app runs locally or self-hosted on Convex, with models through OpenRouter. The demo on GitHub Pages replays recorded conversations with no backend. Most of this is still being built; [docs/architecture.md](./docs/architecture.md) is the target design.

## Packages

| Package                                 | What it does                                           |
| --------------------------------------- | ------------------------------------------------------ |
| `@yugioh-rulings-chatbot/design-system` | Tokens, Tailwind theme, and components for the web app |

## Apps

| App        | What it is                                                           |
| ---------- | -------------------------------------------------------------------- |
| `apps/web` | The demo deployed at https://nedhmn.github.io/yugioh-rulings-chatbot |

## Quick start

```sh
pnpm install
pnpm dev
```

Everything else is in [docs/](./docs/README.md).

## License

MIT. Third-party notices are in [LICENSE](./LICENSE).
