---
name: tms-93-audit-backlog
description: "Codebase-audit stage 4 — after the user approves the triage, register the findings in the backlog: fold into existing bundles or create new bundled tickets (bundle-don't-shard), one row each, route pre-launch manual actions to the launch playbook. Writes 02_backlog.md. Final stage of the tms-audit-* pipeline. Use when the user invokes /tms-audit-backlog after approving 01_triage.md."
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# Codebase Audit — Stage 4: Backlog

Commit the approved triage into durable work items. This is the only audit stage that edits the backlog and launch playbook — so it runs only AFTER the user has reviewed and approved `01_triage.md`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for: the backlog location and row format (the row is an index, not storage — one line, `See docs/TF2-XXX/`), the Future Work Capture rules, bundle-don't-shard / consolidation and ID-numbering rules, the ticket-folder convention, the Pre-Launch Manual Action Capture rules and launch-playbook paths, and the output language.

## Method

1. **Precondition.** `01_triage.md` exists and the user approved the bundles (and any edits). If not approved, stop and ask. Find the active `docs/AUDIT-*/` folder (latest, or `$1`).

2. **Drop trivia first.** Run each approved item through the project's "does this deserve a backlog row?" triage. One-line cosmetics and obvious next-touch cleanups are NOT follow-ups — note them as dropped (with reason) in `02_backlog.md`, don't shard the backlog with them.

3. **Fold before creating.** For each surviving bundle: check existing open backlog bundles for the same epic/surface/driver. If it fits, **edit** that bundle's ticket and row (extend composition, update driver, add `Absorbs:`/`(formerly …)` tags per project rules) rather than adding a new row.

4. **Create new bundled tickets** for the rest, per project rules: create `docs/TF2-XXX/00_ticket.md` with the full Composition (sub-items, `file:line`, driver refs, and `Source: docs/AUDIT-<date>/`); add exactly **one** backlog row per bundle (≤ one line, short phrase + priority + `See docs/TF2-XXX/`); keep the table in strict numeric ID order. Bundle ID = lowest free / lowest among merged, per the project's numbering rule.

5. **Blockers get their own priority.** Real Class A/B findings are registered at their true priority (Must/Should), not buried inside a Could-priority polish bundle.

6. **Route manual actions.** Any pre-launch manual action surfaced by the audit (apply migration, run a smoke, set an env key, external config) → the launch playbook document matching its stage, written so a non-programmer can execute it (exact steps, commands/SQL, pass criterion). Do not leave it only in `02_backlog.md`.

7. **Write `02_backlog.md`:** a record of exactly what landed where — every TF2-XXX created or updated with its path, which findings map to which ticket, what was dropped and why, and which launch-playbook docs received which manual items.

## Closing

Report (project's output language) per the project's conversation contract: list the TF2-XXX IDs + paths created/updated, the launch-playbook items added (with migration numbers if any), what was dropped, and any remaining blockers needing attention. Never end with "recorded in 02_backlog.md" as the only signal — name the concrete backlog IDs and paths.
