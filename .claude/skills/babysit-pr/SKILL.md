---
name: babysit-pr
description: Keep a stack's PRs green, fix red CI on your own, report review findings for the user to decide on, and restack after merges. Use after opening PRs, when the user says babysit, watch, or get it green, and after a merge.
---

# babysit-pr

Outcome: every layer green, review findings summarized once, nothing changed that the user did not ask for. Merge is theirs.

## Checks

```sh
gh pr checks <n> --watch
gh run view <id> --log-failed
```

Waits longer than a few minutes go to a background agent on opus that watches and reports once. It never edits, checks out, or rebases: it shares this checkout with the main loop.

Two checks run on PRs, both in the `CI` workflow: `gate` (the same steps as `pnpm gate`) and `conventional title`. `pages` and `release` only run on pushes to `main`. A failing check is yours, fixed in the main loop between layers:

```sh
gh stack checkout <broken branch>
# fix, gate, /commit (a title failure is fixed with gh pr edit --title)
gh stack rebase --upstack --no-trunk
gh stack push
gh stack top
```

Never rerun a check without a change. A failure outside the diff gets reported, not worked around.

## Reviews

```sh
gh pr view <n> --json reviews,reviewDecision
gh api repos/{owner}/{repo}/pulls/<n>/comments --paginate --jq '.[] | {path, line, body, user: .user.login}'
gh api repos/{owner}/{repo}/issues/<n>/comments --paginate --jq '.[] | {body, user: .user.login}'
```

Every comment is a hypothesis. Prune stale ones, dedupe, verify each survivor against the current code, then post once in chat: the count and tally, then Fix / Later / Skip, each a short heading plus one or two sentences. Wait for the user to pick before changing code, replying, or resolving threads.

## Merging

GitHub treats the stack as one unit; `gh pr merge` on a layer fails. Merge is the user's unless they say so in chat. Then, announced first since it redeploys the Pages demo:

```sh
gh stack merge <top> --squash --yes
```

Every layer up to `<top>` lands atomically, one squash commit each, and the new `main` head runs one `CI` workflow.

## After a merge

```sh
gh stack sync
```

If layers remain open, this rebases them onto `main` and retargets their PRs; watch their checks again. When the whole stack is merged, drop it from local state, or the next `gh stack sync` on `main` fails with "belongs to multiple stacks":

```sh
git checkout main && git pull -q
jq '.stacks |= map(select(any(.branches[]; .pullRequest.merged != true)))' .git/gh-stack > /tmp/gh-stack && mv /tmp/gh-stack .git/gh-stack
git branch -D <merged branches>
```

Then hand back to `kickoff`. Confirm the demo picked up the new `main` head: `gh run list --workflow CI --branch main --limit 1` is green, `pages` included.

## Report

One message when findings wait on the user or when stuck. Green layers are not reported one by one; `kickoff` hands off the stack.
