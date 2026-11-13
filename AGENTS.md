<!-- intent-skills:start -->

## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:

- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

# Agents

| Working on                               | Read first                |
| ---------------------------------------- | ------------------------- |
| A package or app                         | Its own `README.md`       |
| Running it                               | `docs/getting-started.md` |
| Files, folders, or imports in `apps/web` | `docs/web.md`             |
| Backend tables or data sources           | `docs/data.md`            |
| Workflows, versions, changelog, releases | `CONTRIBUTING.md`         |

`.agents/skills/release` before merging a release PR.

## Rules

- Parse data into a domain type at the I/O boundary where it arrives. Never pass an open
  record, `unknown`, or a runtime type check downstream as a contract.
- Run the gate in `CONTRIBUTING.md` before every push. A red step is fixed in the source.
  A lint override is scoped to a path and carries its reason in the lint config.
- Commit subjects are lowercase conventional commits and they are the release notes.
  Write the subject for the person reading the changelog.
- No `Co-Authored-By` trailer, ever. The person who pushes is the author.
- Third-party skills and vendored rules are never edited in place. Edit upstream or fork it.
- No comments or docstrings in code files. Names and types carry the what; the why goes in the
  commit, the PR, or the docs. Exceptions: lint override reasons in lint configs, license and
  attribution headers, and directives a tool reads.
- No em dashes.
