---
name: tms-review
description: "Pipeline stage 06 — review gate; verify implementation against the design contract, issue go/no-go"
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
5. **Close the task in the external delivery docs (mandatory on `go` / `conditional_go`).** The review gate is not finished when `06_review_gate.md` is written — the task must also be marked done where the project tracks status, otherwise the backlog still shows it open. Read `AGENTS.md` for which external doc owns task status (backlog / roadmap / sprint plan) and where it lives.

   **The backlog row is an index, not a storage location — keep it to ONE short line (≤200 chars).** Set status to `Done` / `Done (conditional_go)` (or leave open on `no-go`) with: the date, the verdict, a ≤1-line plain-language phrase of *what shipped* (actually delivered scope, not the original ticket wording if it was narrowed), and a `См. docs/<TASK-ID>/` pointer. **Do NOT paste the review summary, sub-item lists, migration numbers, condition lists, file paths, or follow-up chains into the backlog row.** That full detail already lives in `06_review_gate.md` (verdict + conditions) and in the launch playbook (manual steps) — duplicating it into the backlog is what bloats it into an unreadable wall of text. If a row is creeping past one line, the surplus belongs in `06_review_gate.md`, linked. **Ignore the verbose multi-sentence rows that some legacy closed tasks contain — they are the anti-pattern this rule corrects, not a template to replicate.** On `no-go`, leave the task open and note in one line what blocks closure.

   Per the conversation contract, the final user-facing summary must name which external doc was updated and to what status.
