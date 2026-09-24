---
name: tms-plan
description: "Pipeline stage 03 — delivery plan split into waves with scope, files, acceptance, M/E/R/C execution roles, scope-drift triggers, stage-04 readiness gates, and required 04b review depth"
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
   - **C — Classic maximum-risk:** consciously justified full role set and broad first-pass plus fresh final 04b reviewer. If the task is C as a whole, every implementation wave is C unless the skeptical plan review records a specific evidence-backed lower-risk exception. Do not select C merely to be safe.
4. For each wave record: scope; expected files/owner layers; acceptance; profile and trigger; implementation/proving roles; code owner; validation; stage-04 readiness gate; what 04b must stress-test.
5. Create one canonical append-only **risk ledger** for the whole plan: `R-ID | business invariant | trigger/surface | owner layer | required proof | failure signal | owning wave | search map`. Every wave points to its owning R-IDs instead of copying or redefining them. Profile M/E may legitimately have no entries or 1–3; Profile R/C normally has 3–7. Later stages may append `X-*` risks but must not change an existing R-ID's meaning.
6. For every R/C wave define a stage-04 readiness gate: acceptance and required validation green on the current fingerprint; every R/X-ID evidenced; no unresolved A/B or systemic C; and a fresh stage-04 Reviewer score of at least `8.0/10` without contradictory findings. Require an additional adversarial cross-wave integration review for Profile C before 04b.
7. Record a scope-drift baseline from expected paths, owner layers and risk triggers. Stage 04 must stop with `REPLAN_REQUIRED` if implementation adds an unplanned trust boundary/owner layer/profile trigger, or if the task-owned path set grows materially (default signal: more than 25% beyond the planned paths) without a bounded same-owner explanation.
8. Run one skeptical plan review. Prefer a fresh read-only Agent. Give it the approved design and draft plan, ask it to re-derive every profile and identify missing owner layers, roles, tests, rollout ordering, ledger entries, scope-drift triggers, readiness gates and 04b depth. Do not reveal the planner's preferred answer.
9. Fold verified corrections into the plan. Write `docs/$1/03_delivery_plan.md` with waves, profiles, role ownership, scope baseline, readiness gates, validation, the single canonical risk ledger, implementation order, and what 04b must independently stress-test.

## Stop

Stop after `03_delivery_plan.md`. Do not implement. Report the selected profiles, highest-risk wave, reviewer corrections, and any blocker.
