# Task pipeline template

One folder per task, at your task-folder location (the `{{TASK_FOLDER_PATTERN}}` you set in `AGENTS.md`,
e.g. `docs/<TICKET-ID>/`). Each stage runs in a fresh context and writes exactly one of these eight files:

| # | File | Stage skill | What it holds |
|---|---|---|---|
| 00 | `00_ticket.md` | `tms-00-ticket` | The problem in one sentence from the user's side, who it affects, boundaries. |
| 01 | `01_research.md` | `tms-01-research` | Facts as-is: the vertical with a "Hands on" column, neighbours, one row per item of every countable set, "absent" kept apart from "not found by search". No opinions. |
| 02 | `02_design.md` | `tms-02-design` | Owning layer, the owner's decisions, before → after acceptance rows, design by layer, TDD matrix, rollback. |
| 03 | `03_plan.md` | `tms-03-plan` | Phases, normative contracts, File Ownership (the hard boundary of stage 04), seam table, runnable validation rows, fresh-reader check, a RED-test specification per phase. |
| 04 | `04_implementation.md` | `tms-04-implement` | One executor, phase by phase, test first; the seam walk; the whole-task check; one security pass only when a security trigger fired. |
| 04b | `04b_review.md` | `tms-04b-review` | Up to five fresh read-only review passes. Blocking findings, and a route for every other one: fixed now, backlog proposal, trigger register or dropped. No score, no verdict. |
| 05 | `05_test_report.md` | `tms-05-test` | Every validation row from the plan with its exit code and marker; primary (user-visible) and secondary (code) signal; what was not run. |
| 06 | `06_review_gate.md` | `tms-06-gate` | Proof that the task works, acceptance row by row, the 04b routes as they are, the decision. |

`tms-run` runs the whole chain and dispatches each stage for you; you can also call the stages one by one.

## Who stops the pipeline

- **Owner stop 1 — after `02_design.md`.** The owner reads the design and approves it (`Status: APPROVED`).
  Product forks are asked during design, one question at a time, before a solution is chosen.
- **The lead signs `03_plan.md`** with a date. The owner does not review plans.
- **Owner stop 2 — `06_review_gate.md`.** Only a human writes `go`. The lead may sign `conditional_go`
  when the only thing left is execution (a live check, a rollout, a runbook step), naming the
  launch-playbook document that closes it. The gate goes to the owner whenever there is a product fork,
  an irreversible or outward-facing action, risk to data or money, a `no_go`, or work the owner has to do.

**Language:** write the *content* in your project's output language (`{{OUTPUT_LANGUAGE}}` in `AGENTS.md`).
The English headings are scaffolding — translate them if the output language is not English.

Each file here is a copy of the "Artifact template" block in the matching `skills/tms-0*/SKILL.md`; the
skill is the source of truth. Only these eight files are durable task artifacts. Runbooks, SQL playbooks
and checklists live in your documentation base, with at most a short pointer from the task folder.

A worked example of one task through all eight stages is in
[`../example-task/ACME-101/`](../example-task/ACME-101/).
