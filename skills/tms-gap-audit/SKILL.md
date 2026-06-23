---
name: tms-gap-audit
description: "Pipeline stage 02b — bounded gap audit with severity A/B/C/D, perspective rotation, stopping criteria"
argument-hint: "<TASK-ID>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

Run pipeline stage **02b_gap_audit** for `$1` — ONE bounded structured audit pass over the approved design. Not an open-ended review.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for project specifics: task-folder path, WHERE Class C bundles must land in the backlog, severity examples (what counts as a real blocker), output language.

## Method

1. **Precondition:** `02_design.md` is approved. Else stop.
2. **Perspective rotation.** The auditor must use a different reasoning context than the designer (if design was Codex → audit Claude, or vice versa; if same agent → close the "designer hat" output first, then explicitly switch to "auditor hat": treat the design as someone else's work, hunt blind spots across security / concurrency / UX / ops / data integrity / privacy). One structured pass.
3. **Classify each gap into exactly one class. No severity inflation** — Class A means "data loss / security breach / privacy violation / duplicate production data / integrity violation / blocks launch", not "could be nicer":
   - **A — Blocker:** MUST be fixed inline in `02_design.md` before `03`.
   - **B — Incident:** recoverable prod incident (stuck job, missed notification, edge-case UX, incomplete rollback). Fix in `02_design.md` or explicitly pass to `03` with a handling note.
   - **C — Polish:** UX roughness, incomplete i18n, missing metrics/runbook, unclear copy. Capture as **bundled** backlog tickets per project rules (bundle, don't shard).
   - **D — Theoretical:** low probability/blast radius. Backlog only if the fix is obvious and cheap; else drop with a one-line reason in the audit file.
4. **Class A/B fixes are folded into `02_design.md`** in this same session — it stays the single design contract; do not create a parallel source of truth.
5. **Stopping criteria (any one closes the stage):** max 2 passes (2nd only if pass 1 found ≥1 Class A); a full pass with 0 Class A and 0 Class B → stop; gaps predominantly C/D → stop (they belong to code review / `06_review_gate` / first incident). Do NOT run a third pass. Do NOT turn audit into redesign (if the design is fundamentally wrong-shape, return to `02_design` with a flag).
6. Write `<task-folder>/02b_gap_audit.md`: header (who designed, who audited, date), gaps grouped by class, for each A/B the pointer "folded into 02_design §X" or "passed to 03 item Y", for C the draft bundle tickets, for D the backlog entry or drop reason, and the **stopping decision** (which criterion closed the stage).

If the task is `Direct`, minimal-surface `TDD-first` (one endpoint, no auth/persistence/contracts/concurrency/PII/payments), or a straightforward bug fix, the file body may be a single line "skipped per minimal-surface exception".

## Closing — follow-up capture (mandatory)

Class C bundles and any backlogged Class D → register in the project backlog per its rules (bundle, don't shard; for gap-audit Class C specifically, follow the project's placement rule for audit-sourced bundles) **before the turn ends**.

Stop for confirmation before `03_delivery_plan` (staged execution).

## Closing — hand off in a clean context window

After this stage's artifact is written and confirmed, the final message to the user MUST end with a clear hand-off telling them to start the next stage in a **fresh context window** (so the next stage gets only what it needs, not this stage's noise):

> ✅ Stage 02b_gap_audit complete. Start **03_delivery_plan** in a clean context window:
> - **Claude Code:** run `/clear`, then `/tms-plan <TICKET-ID>`
> - **Codex:** run `/clear` (or `/new`), then `/tms-plan <TICKET-ID>`
