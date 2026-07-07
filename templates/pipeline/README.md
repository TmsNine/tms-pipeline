# Task pipeline template

Copy this folder to your task-folder location (the `{{TASK_FOLDER_PATTERN}}` you set in `AGENTS.md`,
e.g. `docs/<TICKET-ID>/`) — one folder per task. Fill the 9 files in order:

1. `00_ticket.md` — what + why, scope, acceptance, source links; classify task mode.
2. `01_research.md` — current state ("as-is"), facts only, open questions.
3. `02_design.md` — the single design contract; minimal sufficient change.
4. `02b_gap_audit.md` — one bounded audit pass over the design (severity A/B/C/D).
5. `03_delivery_plan.md` — work split into waves, each with a risk profile and expected 04b depth.
6. `04_implementation.md` — wave-by-wave execution log, self-checks, validation, and deviations.
7. `04b_loop_review.md` — independent review/fix loop over the implementation diff.
8. `05_test_report.md` — primary (user-visible) + secondary signals.
9. `06_review_gate.md` — verify vs the design contract; go / conditional_go / no-go.

**Language:** write the *content* in your project's output language (set as `{{OUTPUT_LANGUAGE}}` in
`AGENTS.md`). The English headings below are scaffolding — translate them if you prefer.

Only these 9 files are durable artifacts. Supplemental durable material (runbooks, SQL playbooks,
checklists) lives in your documentation base, with at most a short pointer here.
