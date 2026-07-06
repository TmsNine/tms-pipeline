---
name: tms-00-ticket
description: "Run pipeline stage 00 (ticket) for a backlog task in a project that follows the 9-stage delivery pipeline (00_ticket → 06_review_gate). Create docs/TASK-ID/00_ticket.md, confirm preconditions, classify task mode. Use when the user asks to 'do 00', 'create the ticket', 'завести тикет', or starts a new pipeline task by its ID. Also match the legacy command /tms-ticket."
---

# Stage 00 — Ticket

This carries the universal method. Read THIS project's `AGENTS.md` first (Codex reads it natively) for specifics: task-folder convention, backlog and traceability locations, source-of-truth docs, output language.

## Method

1. **Confirm preconditions.** The item exists in the backlog and is the exact target. Traceability points to the right product/architecture sources. Open questions are resolved or flagged as blockers.
2. **Create the task folder and `00_ticket.md`**: driver, scope, acceptance, links to sources. Keep it concise — the ticket is an index, not storage; the backlog row stays one line.
3. **Classify the task mode**: `Direct` / `Investigation` / `TDD-first` (default `TDD-first` unless clearly `Direct`).

Stop for confirmation before `01_research` unless the user asked to go end-to-end.
