---
name: tms-review
description: "Pipeline stage 06 — review gate; verify implementation against the design contract, issue go/no-go"
argument-hint: "<TASK-ID>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

Run pipeline stage **06_review_gate** for `$1`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for project specifics: task-folder path, launch-playbook location, output language.

## Method

1. **Verify the implementation against the design contract.** This stage is implementation-vs-design — distinct from `02b_gap_audit` (design-vs-risks) and from human peer review. Check against `02_design.md` and the acceptance criteria in `03_delivery_plan.md`.
2. **Confirm:** acceptance criteria met; no design drift; change-surface triggers handled (contracts producer+consumer, auth, async idempotency, persistence read+write paths); validation evidence present (`05_test_report.md`); documentation aligned; follow-ups consolidated into the backlog and pre-launch manual actions captured in the launch playbook. A task is NOT done if the visible symptom is gone but the same mechanic stays structurally inconsistent across coupled layers.
3. **Verdict:** `go` / `conditional_go` (name the manual condition explicitly and ensure it is recorded in the launch playbook, not just here) / `no-go` with reasons and the best next experiment.
4. Write `<task-folder>/06_review_gate.md` with the checks, evidence pointers, and verdict.
5. **Close the task in the external delivery docs (mandatory on `go` / `conditional_go`).** The review gate is not finished when `06_review_gate.md` is written — the task must also be marked done where the project tracks status, otherwise the backlog still shows it open. Update the task's status entry to `Done` (or `Done (conditional_go)` when a manual condition remains) with the date and verdict, matching the project's existing closed-task convention (study how the last few closed tasks were recorded and replicate that exact format — status value, summary line, links to `05`/`06`, follow-up + manual-condition notes). Read `AGENTS.md` for which external doc owns task status (backlog / roadmap / sprint plan) and where it lives. Reflect the **actually delivered** scope, not the original ticket wording, if scope was narrowed. On `no-go`, leave the task open and note what blocks closure. Per the conversation contract, the final user-facing summary must name which external doc was updated and to what status.

## Closing — clear context before the next task

This is the final stage. After writing the verdict and updating the backlog/status, the final message MUST tell the user to clear context before starting any new task:

> ✅ Review gate complete (verdict: go / conditional_go / no-go). Before the next task, start in a clean context window:
> - **Claude Code:** run `/clear`
> - **Codex:** run `/clear` (or `/new`)
