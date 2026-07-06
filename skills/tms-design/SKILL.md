---
name: tms-design
description: "Pipeline stage 02 — author the single design contract, minimal sufficient change, capture follow-ups"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

Run pipeline stage **02_design** for `$1`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for project specifics: product rules, tenant/auth/persistence constraints, task-folder path, backlog location, output language.

## Method

1. **Read** `00_ticket.md` + `01_research.md` (+ interview answers if any).
2. **Design the minimal sufficient change at the owning layer.** Smallest surface area, moving parts, and abstraction count — not the smallest diff at any cost. Prefer flat over layered, decoupling over DRY, local clarity over clever reuse. Do not patch symptoms or add child-side fallbacks that hide an upstream mistake; fix the owner layer.
3. **Inspect change-surface triggers** and design for them: shared contracts/schemas (producer + consumer), routes/guards/layouts, queries/mutations (keys, invalidation, loading/empty/error/success/optimistic/stale states), schema/persistence (serializers, migrations, read + write paths), auth/permission, async (retries, idempotency, ordering, failure visibility), legal/billing/privacy copy.
4. Write `<task-folder>/02_design.md` as the **single design contract**: what "done" means, 3–5 observable pass/fail criteria, primary signal (user-visible/runtime) + secondary signals. If migrations/contracts/auth change, state rollout order.

If the design exposes a genuinely open product/architecture tradeoff, present up to two viable options with one recommendation and ask before locking.

## Closing — follow-up capture (mandatory)

Deferred work, future improvements, spec gaps, or architecture deltas discovered while designing → consolidate into the project backlog (or the owning product/architecture doc) per its rules **before the turn ends**: bundle, don't shard; check existing bundles first; backlog row = one-line index. Follow-ups left only in `02_design.md` are lost.

Stop for confirmation before `02b_gap_audit` (staged execution).
