---
name: plan-issue
description: Turn an ask into an approved brief, a parent issue, and sub-issues. Called by kickoff; use directly when the user says plan this.
---

# plan-issue

Outcome: a parent issue whose body is the brief the user approved, and one linked sub-issue per PR. No branch, no code.

## Read

`AGENTS.md`, the code the ask points at, and the `README.md` of every app or package it touches. The layout is still settling: read the tree as it is now (`ls apps packages`) instead of assuming which apps and packages exist. Read what exists before proposing what changes.

## Brief, in chat

Post the brief in the thread, not on GitHub. These headings, each a short paragraph or list:

- **Understanding**: the ask in your words, with what triggered it.
- **Approach**: what changes, per app or package. Name files. New apps or packages are named here with their role.
- **Sub-issues**: one line each, in landing order, each one PR small enough to hold in your head.
- **Out of scope**: what you will not do.
- **Blast radius**: other apps and packages, CI, the Pages demo, releases. "None" is fine.
- **Verification**: pages and commands that prove it, per `verify-web`.
- **Open questions**: only ones that change the approach. Otherwise "none".

Then wait. Revise until the user says go.

## On go

```sh
gh issue create --label enhancement --title "<what it does>" --body-file <brief>
gh issue create --label enhancement --title "<part>" --body-file <file>      # per sub-issue, body opens "Sub-issue of #<parent>"
id=$(gh api repos/{owner}/{repo}/issues/<sub> --jq .id)
gh api -X POST repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id=$id
```

Labels: `enhancement`, `bug`, or `documentation`. Brief body uses the brief's headings as `### `. Sub-issue bodies: `### Task` and `### Done when`. An existing issue gets the brief as a comment instead of a new parent. Then hand back to `kickoff`.
