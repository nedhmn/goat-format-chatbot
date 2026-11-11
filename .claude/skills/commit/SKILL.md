---
name: commit
description: Commit the staged changes with a lowercase Conventional Commit subject. Use when the user says "/commit", "commit this", or asks for a commit message, and from work-issue.
---

# /commit

## Steps

1. Read what is staged. If nothing is staged, say so and stop.

   ```sh
   git diff --cached --stat
   git diff --cached
   ```

2. Type: `feat` new capability, `fix` defect, `perf`, `refactor`, `docs`, `deps`, `revert`, and `chore`/`test`/`ci`/`build`/`style` for the rest. The first seven land in the changelog, the rest do not. `!` before the colon only for a breaking change.

3. Scope is optional: the app or package directory name (`web`, `api`, `design-system`, ...) or `skills`. Omit it when the change spans several.

4. Subject: lowercase, imperative, under 60 characters, no full stop, no issue numbers, no file paths. No em dashes. It is a release note: write it for the person reading the changelog.

5. Body only when the why is not obvious. Never a `Co-Authored-By` trailer or any AI attribution.

6. `git commit -m "type(scope): subject"`. The `commit-msg` hook rejects a subject that does not match.

## Rules

- One commit per coherent change. Split a staged diff that does two things.
- Never commit on `main`.
