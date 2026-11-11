---
name: kickoff
description: Take an ask from chat to a green stack of PRs, one parent issue per thread. Use when the user opens a thread with an ask or an issue number, or says kick off, continue, or where were we.
---

# kickoff

Outcome: a parent issue whose sub-issues each have a green PR in one `gh stack`, and one message to the user that the stack is ready. The user approves the brief, reviews the stack, and merges. Runs `plan-issue`, then `work-issue` per sub-issue, then `babysit-pr`, without being asked again.

## Where things stand

```sh
git branch --show-current
git status --short
gh stack view
gh issue view <n> --comments        # when a number was given
```

Say the state in one line, then enter the matching step.

| State                                                     | Step                                    |
| --------------------------------------------------------- | --------------------------------------- |
| Ask in chat, or an issue with no approved brief           | Plan                                    |
| Parent issue with approved brief, sub-issues without a PR | Loop, at the first sub-issue with no PR |
| Uncommitted work on a stack branch                        | `work-issue` from its Verify step       |
| Every sub-issue has a green PR                            | Hand off                                |
| User merged part of the stack                             | `babysit-pr`, After a merge             |

## Plan

`plan-issue`: brief in chat, iterate, and on the user's go create the parent issue and sub-issues. Work that fits one PR still gets a parent with one sub-issue. One sub-issue per independently shippable change.

## Loop

One sub-issue at a time, in order, each one layer of the stack:

1. First layer: `git fetch -q origin main && git checkout main && git pull -q && gh stack init <branch>`. Later layers: `gh stack add <branch>`. The working tree must be clean first.
2. `work-issue`: implement, verify, gate, PR. Register the PR with the thread.
3. Start the next sub-issue without reporting. A background watcher reports lower layers' checks; red ones are fixed in the main loop between layers, per `babysit-pr`.

Branch names are task-based (`fix/...`, `feat/...`, `chore/...`, `docs/...`), never tool or agent prefixes.

## Hand off

When every layer is green:

1. Mark every PR ready: `gh pr ready <n>`.
2. One message: the stack (full PR links bottom to top, merging the top PR lands all of it), what to look at, the local URLs to check from `.dev/ports.env` with the dev servers left running on the top branch (per `verify-web`), and anything that needs a decision.

Then `babysit-pr` until the stack is merged. When it is, say so in one line, close the parent issue if GitHub did not, and switch back to `main`.

## Deploys

The only thing this repo deploys is the static demo: every push to `main` runs the CI `pages` job, which publishes `apps/web` to GitHub Pages. The AI chat app (`apps/web` against `apps/api`) runs locally and has no hosted deploy. The same push updates the release-please PR; that PR is never part of a stack and is merged only through the `release` skill.
