# Worked example — ACME-101

A fully synthetic walkthrough of one small task through all eight stages, so you can see what each stage
writes before running it yourself. The "project" is a fictional web app (`ACME`) with an `api`, a `web`
front end and a `shared` package; none of it is real.

**Task:** an "Export to CSV" button on the reports list that downloads exactly the filtered rows the
manager may see.

Read the files in order:

| File | What to notice |
|---|---|
| [`00_ticket.md`](ACME-101/00_ticket.md) | The problem in one sentence from the user's side, and what the task does not do. |
| [`01_research.md`](ACME-101/01_research.md) | The vertical as a table where every row says what it hands on; a countable set with one row per item; "absent — checked" kept apart from "not found by search". Facts only. |
| [`02_design.md`](ACME-101/02_design.md) | One product question asked before the solution was chosen, recorded as question → answer → consequence; acceptance rows before → after; `Status: APPROVED` after owner stop 1. |
| [`03_plan.md`](ACME-101/03_plan.md) | Normative contracts carried verbatim, File Ownership, the seam table, validation rows that paste into a terminal (including the task check and one check that crosses every seam), the fresh reader's findings, a RED-test specification per phase, and the lead's signature with its date. |
| [`04_implementation.md`](ACME-101/04_implementation.md) | One executor, phase by phase, test red before green; the seam walk quoting both ends of each hop; the whole-task check; one security pass because a security trigger fired. |
| [`04b_review.md`](ACME-101/04b_review.md) | Four fresh review passes ended by the stagnation rule; one blocking finding fixed in the loop; one finding on each route — fixed now, backlog proposal, trigger register, dropped; trust in the tests. |
| [`05_test_report.md`](ACME-101/05_test_report.md) | Every plan row run, with exit code and marker, and the row counts matching; the primary signal kept apart from the secondary one; what was not run. |
| [`06_review_gate.md`](ACME-101/06_review_gate.md) | Proof that the task works comes first; the 04b routes as they are; a `conditional_go` signed by the lead that names the launch-playbook step closing it; one backlog proposal for the owner to answer yes or no. |

No stage scores the work, and no agent writes `go`: that word belongs to the owner. The blank templates
are in [`../pipeline/`](../pipeline/).
