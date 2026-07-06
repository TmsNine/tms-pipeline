---
name: tms-02b-gap-audit
description: "Run pipeline stage 02b (bounded gap audit) for a backlog task in a project that follows the 9-stage delivery pipeline. One structured audit pass over the approved design with severity classes A/B/C/D, perspective rotation, and predefined stopping criteria. Use when the user asks to 'do 02b', 'gap audit', 'аудит дизайна' for a pipeline task by ID. Also match the legacy command /tms-gap-audit."
---

# Stage 02b — Bounded gap audit

ONE bounded structured pass over the approved design — not an open-ended review. Read THIS project's `AGENTS.md` (Codex reads it natively) for specifics: task-folder path, WHERE Class C bundles must land in the backlog, severity examples, output language.

> **Model tier.** This stage is risk judgement. Use the current strong model; use high/xhigh when the design touches auth/RLS/payments/PII, migrations, lifecycle/state machines, queues, tenant isolation, or GDPR. Spark (`gpt-5.3-codex-spark`) is acceptable only for quick evidence lookup, not for the final gap classification.

## Method

1. **Precondition:** `02_design.md` is approved. Else stop.
2. **Perspective rotation.** Use a different reasoning context than the designer. If the design was authored by Claude, Codex auditing it IS the rotation — lean into it: treat the design as someone else's work and hunt blind spots across security / concurrency / UX / ops / data integrity / GDPR. One structured pass.
3. **Classify each gap into exactly one class. No severity inflation** (Class A = data loss / security breach / GDPR / duplicate pilot data / blocks launch, not "could be nicer"):
   - **A — Blocker:** fix inline in `02_design.md` before `03`.
   - **B — Incident:** recoverable prod incident; fix in `02_design.md` or pass to `03` with a handling note.
   - **C — Polish:** capture as **bundled** backlog tickets per project rules (bundle, don't shard; gap-audit Class C goes only into the backlog's Bundled-follow-ups section).
   - **D — Theoretical:** backlog only if obvious and cheap; else drop with a one-line reason.
4. **Class A/B fixes fold into `02_design.md`** this session — it stays the single design contract.
5. **Stopping criteria (any one closes the stage):** max 2 passes (2nd only if pass 1 found ≥1 Class A); a full pass with 0 A and 0 B → stop; gaps predominantly C/D → stop. Do NOT run a third pass. Do NOT turn audit into redesign (wrong-shape design → return to `02_design` with a flag).
6. Write `docs/<TASK-ID>/02b_gap_audit.md`: header (who designed, who audited, date), gaps by class, A/B pointers ("folded into 02_design §X" / "passed to 03 item Y"), C draft bundle tickets, D entry-or-drop, and the **stopping decision**.

If the task is `Direct`, minimal-surface `TDD-first`, or a straightforward bug fix, the body may be a single line "skipped per minimal-surface exception".

## Closing — follow-up capture (mandatory)

Register Class C bundles and any backlogged Class D in the project backlog per `AGENTS.md` rules before the turn ends.

Stop for confirmation before `03_delivery_plan`.
