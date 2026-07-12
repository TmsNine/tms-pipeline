---
name: tms-plan
description: "Pipeline stage 03 — delivery plan split into waves with scope, files, acceptance, M/E/R/C risk profile, implementation roles, and required 04b review depth"
allowed-tools:
  - Read
  - Write
  - Grep
  - Glob
  - Agent
  - TodoWrite
---

Run pipeline stage **03_delivery_plan** for `$1`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for the task-folder path, output language, risk triggers, validation commands, follow-up rules, and launch-playbook locations.

> **Model tier.** Use a balanced strong model for normal decomposition (for example Sonnet). Use the strongest available reasoning tier for unresolved R/C judgement, auth/tenant scope, payments, PII, migrations, queues, or lifecycle ambiguity. A cheap tier may format an already-obvious Profile-M plan, but it must not decide risk. Never use Fast mode.

## Method

1. Read the approved `02_design.md` and completed `02b_gap_audit.md`. Do not reopen product choices unless the design is internally contradictory.
2. Split the design into the smallest coherent waves that can be implemented and proven independently.
3. Assign exactly one profile to every wave:
   - **M — Mechanical/bounded:** local, low-ambiguity change; narrow role set and narrow independent 04b diff review.
   - **E — Evidence-heavy:** correctness depends on code-map/search completeness; use bounded evidence collectors and standard independent 04b.
   - **R — Risk review required:** auth, permissions, tenant scope, payments, PII/privacy, migrations, lifecycle, queues/jobs, external effects, or similar blast radius; use Architect/Security proving roles and risk-focused 04b.
   - **C — Classic maximum-risk:** consciously justified full role set and broad first-pass plus fresh final 04b reviewer. Do not select C merely to be safe.
4. For each wave record: scope; owned files/surfaces; acceptance; profile and trigger; implementation roles; validation; what 04b must stress-test.
5. Create one canonical append-only **risk ledger** for the whole plan: `R-ID | business invariant | trigger/surface | owner layer | required proof | failure signal | owning wave | search map`. Every wave points to its owning R-IDs instead of copying or redefining them. Profile M/E may legitimately have no entries or 1–3; Profile R/C normally has 3–7. Later stages may append `X-*` risks but must not change an existing R-ID's meaning.
6. Run one skeptical plan review. Prefer a fresh read-only Agent. Give it the approved design and draft plan, ask it to re-derive every profile and identify missing owner layers, tests, rollout ordering, ledger entries, and 04b depth. Do not reveal the planner's preferred answer.
7. Fold verified corrections into the plan. Write `docs/$1/03_delivery_plan.md` with waves, profiles, validation, the single canonical risk ledger, implementation order, and what 04b must independently stress-test.

## Stop

Stop after `03_delivery_plan.md`. Do not implement. Report the selected profiles, highest-risk wave, reviewer corrections, and any blocker.
