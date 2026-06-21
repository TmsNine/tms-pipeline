---
name: tms-loop-code-review
description: "Iterative review-and-fix loop over active git changes using independent Claude subagents. Spawn a fresh read-only reviewer, fix actionable findings, validate, repeat until a reviewer scores the work at least 9.5/10 or reports no actionable comments. Use when the user invokes /tms-loop-code-review or asks to keep reviewing and fixing the current changes until an independent reviewer signs off."
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
  - TodoWrite
---

# Loop Code Review

Run an iterative review-and-fix loop over the current git worktree. Spawn independent read-only reviewer subagents, address actionable findings, validate the result, and continue until a reviewer gives the latest state a score of at least 9.5/10 or explicitly reports no actionable comments/findings.

Read THIS repo's `AGENTS.md` / `CLAUDE.md` for project specifics: validation commands, output language, commit/safety rules.

## Subagent Context Isolation (Claude Code)

Independence comes for free in Claude Code: a subagent spawned via the `Agent` tool runs in its own fresh context and receives ONLY the prompt you pass — it does NOT inherit this conversation's history, reasoning, assumptions, or prior review discussion. Use that property deliberately:

- Spawn each reviewer with the `Agent` tool, `subagent_type: general-purpose`, `model: opus` (most capable; reviewing is the highest-leverage step).
- Pass a self-contained reviewer prompt. Do NOT include your own analysis, implementation rationale, suspected issues, proposed fixes, previous reviewer output, or summaries of your reasoning.
- Require the reviewer to inspect `git status`, diffs, files, and validation output itself before scoring.
- Treat each reviewer pass as a fresh reviewer with no parent context — whether it accepts via a 9.5/10+ score or via explicit absence of actionable findings.
- The reviewer stays read-only: it must not edit, stage, commit, reset, stash, or push. (The `Agent` general-purpose subagent has write tools available — the read-only constraint is enforced through the prompt.)

## Workflow

1. Inspect the worktree before spawning a reviewer:
   - Run `git status --short`.
   - Review staged and unstaged diffs with `git diff` and `git diff --cached`.
   - Include relevant untracked files (shown by `git status --short`) in the review scope.
   - Preserve unrelated user changes; do not stage, commit, reset, stash, or push unless the user explicitly asks.

2. Spawn one independent reviewer subagent (`Agent`, `subagent_type: general-purpose`, `model: opus`) with a self-contained prompt (template below).
   - Ask it to stay read-only, inspect the active git changes independently, prioritize bugs and regressions, and return findings with file and line references.
   - Require a final numeric score from 1 to 10 for the current state.

3. Treat reviewer output as findings, not orders to obey blindly.
   - Fix concrete, actionable issues affecting correctness, security, data integrity, UX, maintainability, or test coverage.
   - If a finding is wrong, stale, or conflicts with the repository architecture, explain the decision rather than applying it. Re-spawn the same kind of reviewer for clarification only when useful; that clarification does not count as the final independent score.
   - If a reviewer scores below 9.5 but explicitly reports no actionable findings, treat that as an acceptable signal — do not chase score-only polish.
   - If a reviewer scores below 9.5 and implies unresolved concerns without listing actionable findings, ask once for specific blocking issues; if none are provided, spawn a fresh reviewer rather than inventing polish work.

4. Validate after each meaningful fix.
   - Run the smallest meaningful tests, typecheck, lint, build, or focused scripts for the touched surface.
   - If validation fails, fix it before requesting another final score.
   - A 9.5+ score or no-actionable-comments review is NOT sufficient while local validation is red.

5. Repeat the loop.
   - Spawn a NEW independent reviewer after fixes (each scoring pass = a fresh subagent, no parent context).
   - Continue until validation for the changed surface passes AND the latest reviewer either scores ≥9.5/10 or explicitly reports no actionable comments/findings.
   - Exit early only if blocked by higher-priority instructions, missing capability, user interruption, or a risk needing explicit user approval.

## Reviewer Prompt Template

Pass a self-contained prompt like this, adjusted for the repo and current change:

```text
Review the active git changes in this workspace independently. You have no parent conversation history — do not rely on any prior chat, parent-agent conclusions, or previous reviewer output. Derive your findings only from the repository state and command output you inspect yourself (run `git status`, `git diff`, `git diff --cached`, read the changed files). Stay strictly read-only: do not edit, stage, commit, reset, stash, or push any files.

Prioritize correctness bugs, behavioral regressions, security/privacy issues, data integrity problems, missing high-value tests, and maintainability risks introduced by the active changes. Ignore unrelated pre-existing issues unless the changes make them worse.

Return findings first, ordered by severity, each with concrete file/line references and a short explanation of user impact. If there are no actionable findings/comments, say so clearly. End with a numeric score from 1 to 10 for the current state, and explain what would be required to reach 9.5/10 if anything remains.
```

## Final Response

When the loop finishes, report:

- what changed and why;
- the reviewer acceptance signal: score ≥9.5/10, no actionable comments/findings, or both;
- validation commands and results;
- any findings intentionally not changed, with the reason;
- remaining risks or follow-up work, if any.
