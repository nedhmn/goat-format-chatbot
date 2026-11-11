---
name: work-issue
description: Implement one sub-issue as one stack layer and open its draft PR with evidence. Called by kickoff per sub-issue; use directly when the user says work on #N.
---

# work-issue

Outcome: the change is on its own stack branch, verified, gated, and open as a draft PR that closes the sub-issue.

## Before code

1. `gh issue view <n> --comments`, and its parent. No approved brief and unclear scope means back to `plan-issue`.
2. `git branch --show-current` is this sub-issue's stack branch, never `main`, and `git status --short` is clean apart from your work.

## Code

- One concern per layer. If it grows past one, split it into a new sub-issue and layer.
- Follow `AGENTS.md`: parse data into a domain type at the I/O boundary, no docstrings or narrative comments, no em dashes. A lint override is scoped to a path and carries its reason in `.oxlintrc.json`.
- A new app or package gets its own `README.md` and its entry in `knip.json`.

## Verify

`verify-web` for anything that renders or serves. Tooling-only layers prove themselves with command output.

## Gate and PR

```sh
pnpm fix && pnpm gate
```

A red step is fixed in the source, never skipped. Then `/commit`, then `/pr`. The PR stays a draft until `kickoff` hands off the whole stack.

## Hand back

Register the PR with the thread, start a background watcher for its checks on opus (watch and report only, never edit; it shares this checkout), and return to `kickoff` for the next layer. No message to the user per layer.
