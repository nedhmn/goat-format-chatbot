---
name: pr
description: Write the title and body for the pull request on the current branch, from the template. Use when the user says "/pr", "open a PR", or asks what the PR should say, and from work-issue.
---

# /pr

PRs squash into `main`, so the title is the commit subject on `main` and CI's `conventional title` check holds it to the `/commit` rules. Work ships as `gh stack` layers: each PR's base is the layer below it, and the bottom layer's base is `main`.

## Steps

1. Read this layer only, against the layer below (works before the PR exists):

   ```sh
   base=$(gh stack view --json | jq -r '.branches[] | select(.isCurrent) | .base')
   git log "$base..HEAD" --format='%h %s'
   git diff "$base...HEAD" --stat
   ```

2. Title: one `/commit`-style subject covering the whole layer. A layer with a `feat` commit gets a `feat` title.

3. Body, one section per heading in `.github/PULL_REQUEST_TEMPLATE.md`:
   - **Closes**: the sub-issue, `Closes #<n>`.
   - **Why**: the problem and the case that surfaced it. One paragraph.
   - **What**: what changed, as a reader of the diff would want it summarized.
   - **Blast radius**: other apps and packages, CI, the Pages demo, releases. "None" is fine.
   - **Evidence**: local screenshots in `.evidence/` or command output, each with what it proves.
   - **Checked**: the gate result and what could not be verified.

4. Create or update:
   ```sh
   gh stack submit --auto                       # pushes the stack, opens missing PRs as drafts
   gh pr edit <n> --title "<title>" --body-file <file>
   gh pr view <n> --json title -q .title        # must print <title>
   ```
   `gh stack submit` titles a multi-commit layer after its branch, so always pass `--title`. If the check prints anything else, fix the title before moving on. Then register the PR with the thread.

## Rules

- Never open a PR outside the stack, and never one based on `main` unless it is the bottom layer.
- If a PR exists for the branch, edit it; don't open another.
- No AI attribution in the body.
