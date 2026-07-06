---
name: tms-06-review
description: "Run pipeline stage 06 (review gate) for a backlog task in a project that follows the 9-stage delivery pipeline. Verify the implementation against the design contract and issue a go / conditional_go / no-go verdict. Use when the user asks to 'do 06', 'review gate', 'ревью' for a pipeline task by ID. Also match the legacy command /tms-review."
---

# Stage 06 — Review gate

Read THIS project's `AGENTS.md` (Codex reads it natively) for specifics: task-folder path, launch-playbook location, output language.

> **Model tier.** The review gate is judgement, not mechanical reporting. Use `gpt-5.4` high for straightforward closure. Use `gpt-5.5` high/xhigh when the task touched auth/RLS/payments/PII, migrations, lifecycle/state machines, queues, or when `05_test_report.md` contains partial validation / `conditional_go` conditions. Spark (`gpt-5.3-codex-spark`) is acceptable only for locating evidence or summarizing known checks, not for the final verdict.

## Method

1. **Start from artifacts, not a fresh wide review.** Read `02_design.md`, `03_delivery_plan.md`, `04_implementation.md`, `04b_loop_review.md`, and `05_test_report.md`. Treat accepted `04b_loop_review.md` as the independent code-review evidence; do not redo a full 04b-style review from scratch unless the 04b artifact is missing, skipped, failed, or contradicted by later evidence.
2. **Verify implementation against the design contract** (`02_design.md`) and acceptance criteria (`03_delivery_plan.md`). This is implementation-vs-design and launch-readiness judgement — distinct from `02b_gap_audit` (design-vs-risks) and `04b_loop_review` (independent code review/fix loop).
3. **Confirm:** acceptance criteria met; no design drift; 04b accepted or an explicit no-go/conditional reason exists; change-surface triggers handled (contracts producer+consumer, auth, async idempotency, persistence read+write paths); validation evidence present (`05_test_report.md`); docs aligned; follow-ups consolidated in the backlog and pre-launch manual actions captured in the launch playbook. A task is NOT done if the symptom is gone but the same mechanic stays structurally inconsistent across coupled layers.
4. **Verdict:** `go` / `conditional_go` (name the manual condition and ensure it is recorded in the launch playbook, not just here) / `no-go` with reasons and the best next experiment.
5. Write `docs/<TASK-ID>/06_review_gate.md` with checks, evidence pointers, 04b status, validation status, launch/manual conditions, and verdict.
6. **Close the task in the external delivery docs (mandatory on `go` / `conditional_go`).** The review gate is not finished when `06_review_gate.md` is written — the task must also be marked done where the project tracks status, otherwise the backlog still shows it open. Read `AGENTS.md` for which external doc owns task status (backlog / roadmap / sprint plan) and where it lives.

   **The backlog row is an index, not a storage location — keep it to ONE short line (≤200 chars).** Set status to `Done` / `Done (conditional_go)` (or leave open on `no-go`) with: the date, the verdict, a ≤1-line plain-language phrase of *what shipped* (actually delivered scope, not the original ticket wording if it was narrowed), and a `См. docs/<TASK-ID>/` pointer. **Do NOT paste the review summary, sub-item lists, migration numbers, condition lists, file paths, or follow-up chains into the backlog row.** That full detail already lives in `06_review_gate.md` (verdict + conditions) and in the launch playbook (manual steps). On `no-go`, leave the task open and note in one line what blocks closure.

The final summary must name which external doc was updated and to what status.
