---
name: tms-ticket
description: "Pipeline stage 00 — create the task ticket and folder, confirm preconditions, classify task mode"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

Run pipeline stage **00_ticket** for `$1`.

This skill carries the universal method. Read THIS project's `AGENTS.md` / `CLAUDE.md` first for project specifics: the task-folder convention (e.g. `docs/<id>/`), where the backlog and traceability live, the source-of-truth doc locations, and the output language for user-facing text.

## Method

1. **Confirm preconditions.** The item exists in the backlog and is the exact target of the task. Traceability points to the right product/architecture sources. Any open questions affecting the item are resolved or explicitly flagged as blockers.
2. **Create the task folder** per the project convention and write `<task-folder>/00_ticket.md`: driver, scope, acceptance, links to the source documents. Keep it concise — the ticket is an **index**, not storage. Multi-paragraph context, bundle composition, and file-path lists belong in the ticket body only if they are the canonical record; the backlog row stays one line.
3. **Classify the task mode**: `Direct` (cosmetic/copy/obvious local edit, no runtime change) / `Investigation` (root cause unclear) / `TDD-first` (behavior, logic, contracts, auth, persistence, validation, routing). Default to `TDD-first` unless clearly `Direct`.

Stop for confirmation before `01_research` (staged execution), unless the user asked to go end-to-end.
