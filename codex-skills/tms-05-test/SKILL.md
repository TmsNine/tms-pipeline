---
name: tms-05-test
description: "Run pipeline stage 05 (test report) for a backlog task in a project that follows the 9-stage delivery pipeline. Validate the changed surface with the cheapest meaningful gates and judge by the primary user-visible signal, not proxies. Use when the user asks to 'do 05', 'test report', 'тесты' for a pipeline task by ID. Also match the legacy command /tms-test."
---

# Stage 05 — Test report

Read THIS project's `AGENTS.md` (Codex reads it natively) for specifics: task-folder path, test runner/scripts, output language. In Codex shell sessions do not assume JS tooling is on PATH (prefer `PATH="/opt/homebrew/bin:$HOME/.bun/bin:$PATH"`).

> **Model tier.** This is mostly mechanical validation and report writing. Use `gpt-5.4-mini` medium when the task is to run known checks and summarize pass/fail. Use `gpt-5.4`/`gpt-5.5` high only when failures require root-cause analysis across auth/RLS/payments/PII/contracts or when the primary user-visible signal is ambiguous.

## Method

1. **Run the smallest meaningful validation** covering the changed surface, cheapest first: targeted tests → typecheck → lint → build → focused scripts → wider suites only if needed. Use the repo's existing infrastructure. If contracts/schemas changed, validate **both producer and consumer** sides.
2. **Judge by the primary signal** (user-visible/runtime behavior), not proxies — green tests/lint/types alone are not success. Treat non-zero exits, runtime errors, failed assertions, type/lint/build errors, timeouts as failed validation. Do not hide failures.
3. Write `docs/<TASK-ID>/05_test_report.md`: exact checks run + what they showed, `Primary signal status` (met / not met / partially validated), `Secondary signal status`. If validation cannot run, say why and name the best substitute signal.

Stop for confirmation before `06_review_gate`.
