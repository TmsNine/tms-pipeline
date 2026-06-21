---
name: tms-test
description: "Pipeline stage 05 — test report; validate primary (user-visible) + secondary signals"
argument-hint: "<TASK-ID>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

Run pipeline stage **05_test_report** for `$1`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for project specifics: task-folder path, test runner / scripts, output language.

## Method

1. **Run the smallest meaningful validation** covering the changed surface, cheapest gates first: targeted tests → typecheck → lint → build → focused scripts → wider suites only if needed. Use the repository's existing test infrastructure. If contracts/shared schemas changed, validate **both producer and consumer** sides.
2. **Judge by the primary signal**, not proxies. The primary signal is user-visible / runtime behavior; green tests, lint, or typecheck alone are not success. Treat non-zero exits, runtime errors, unhandled rejections, failed assertions, type errors, lint errors, build failures, and timeouts as **failed** validation. Do not hide failures — report what failed, what it means, and the next useful experiment.
3. Write `<task-folder>/05_test_report.md`: exact checks run and what they showed, `Primary signal status` (met / not met / partially validated), `Secondary signal status`. If validation cannot be run, say why and name the best available substitute signal.

Stop for confirmation before `06_review_gate` (staged execution).

## Closing — hand off in a clean context window

After this stage's artifact is written and confirmed, the final message to the user MUST end with a clear hand-off telling them to start the next stage in a **fresh context window** (so the next stage gets only what it needs, not this stage's noise):

> ✅ Stage 05_test_report complete. Start **06_review_gate** in a clean context window:
> - **Claude Code:** run `/clear`, then `/tms-review <TICKET-ID>`
> - **Codex:** run `/clear` (or `/new`), then `/tms-review <TICKET-ID>`
