---
name: tms-03-plan
description: "Run pipeline stage 03 (delivery plan) for a backlog task in a project that follows the 9-stage delivery pipeline. Split the work into waves with scope, files, acceptance, implementation profile, and 04b review depth; flag risk-sensitive surfaces. Use when the user asks to 'do 03', 'delivery plan', 'план' for a pipeline task by ID. Also match the legacy command /tms-plan."
---

# Stage 03 — Delivery plan

> **Model tier.** This stage is structured decomposition over an already-frozen design contract (02 approved, 02b audited), driven by explicit profile rules — not open-ended architectural judgement. A cheaper/faster model tier is sufficient and recommended here: `gpt-5.4` high for normal plans, `gpt-5.4-mini` high for obvious Direct/Profile-M-only plans. Keep `gpt-5.5` high/xhigh for `02_design`, `02b_gap_audit`, and plans with auth/RLS/payments/PII/lifecycle ambiguity.

Read THIS project's `AGENTS.md` (Codex reads it natively) for specifics: task-folder path, risk-sensitive surfaces (auth/RLS/tenant/payments/PII/validation), output language.

Start from `02_design.md` and `02b_gap_audit.md` as the source of truth. Do not re-read broad project docs or unrelated code unless the plan needs it for a concrete risk/profile decision.

## Method

1. **Inspect the task folder first.** List/check `docs/<TASK-ID>/` and verify that `02_design.md` and `02b_gap_audit.md` actually exist before making any claim about stage readiness.
2. **Read** `02_design.md` (with folded Class A/B fixes) + `02b_gap_audit.md`. If `02b_gap_audit.md` is missing, stop and report that `03_delivery_plan` is blocked by the missing previous-stage artifact; do not create the plan and do not silently run gap audit unless the user explicitly asks for stage 02b.
3. **Split the work into waves.** Each wave is the smallest coherent unit that can be implemented and proven together.
4. For each wave record: scope, files, acceptance criteria, implementation profile, risk triggers, required self-check roles, validation, expected 04b depth, and a structured **04 risk-handoff seed**. For every Profile R/C wave this seed must be a table, not loose prose:
   - `Invariant` — what must never go wrong for the school/student/teacher/manager/team.
   - `Required proof/test` — the exact automated test, SQL smoke, launch check, or no-code proof stage 04 must produce.
   - `Owner layer` — the route/service/RPC/migration/component that must own the decision.
   - `Failure signal` — what observable result means the invariant is broken.
   - `Risk search map` — risky symbols/search patterns plus adjacent routes/resolvers/tests/mocks to inspect.
   For Profile M/E waves, a shorter prose seed is acceptable, but any auth/tenant/money/PII/lifecycle/concurrency trigger upgrades the wave to the table form.

## Implementation Profiles

Profiles describe stage-04 execution and stage-04b review depth. Stage 04 defaults to mono/main-agent implementation; profiles do **not** automatically mean multi-agent implementation inside 04.

- **Profile M — Mono / bounded:** bounded implementation, clear design/plan, limited blast radius, available targeted tests. Main agent implements and self-checks. 04b still runs.
- **Profile E — Evidence-assisted:** use when code discovery is broad or uncertain. `gpt-5.4-mini` explorer may be used for read-only evidence lookup only; final decisions stay with the main agent.
- **Profile R — Risk review required:** money/payroll, roles, school scope, PII/privacy, migrations, lifecycle/state machines, queues/jobs, Telegram/outbox, external integrations, or meaningful school-facing business logic. Main-agent 04 is allowed, but classic independent 04b is mandatory.
- **Profile C — Full classic allowed:** maximum cost-of-error surfaces: payment providers, mass messaging/free-text delivery, GDPR/privacy retention, tenant isolation with high blast radius, critical migrations/backfills, complex concurrency/atomicity, webhook/security boundaries, or full-codebase audits. Full multi-agent implementation inside 04 is allowed if intentionally chosen; otherwise the plan must state what 04b must stress-test.

Profile selection is based on the **most dangerous touched risk**, not average diff size. If reviewer and planner disagree, use the stricter profile.

## Plan review gate (adversarial — mandatory before finalizing)

Run one explicit skeptical pass over the draft plan. Use an independent read-only reviewer subagent when available and worthwhile; otherwise do the pass locally with the designer's hat OFF. The reviewer exists to catch under-classified profiles and missing 04b depth.

Rubric:

- Re-derive every wave's profile from scratch. Do NOT trust the planner's label.
- Enumerate relevant risk triggers: auth/RLS/JWT/session, tenant-scoping/id resolution, trust-boundary input validation, secrets/signing/webhook verify, payments/payroll, PII/cross-tenant, migration/backfill, lifecycle/state machine, queue/job/idempotency, Telegram/outbox/external effects.
- Burden of proof is on every lower-risk classification. "Small surface" or "mirrors an existing pattern" does not justify a downgrade when the wave changes a trust boundary, money, PII, tenant access, or external side effect.
- Also sanity-check: waves are coherent and ordered; acceptance criteria observable; Class A/B fixes folded into `02_design.md`; audit follow-ups and pre-launch manual actions are carried into a wave or closeout; no scope inflation beyond the contract.
- Fold corrections in before writing. If profile changed, correct stale profile notes in earlier artifacts if they would otherwise contradict the plan.

## Output

Write `docs/<TASK-ID>/03_delivery_plan.md` (post-review version), including:

- wave list and order;
- implementation profile + risk trigger reason per wave;
- required self-check roles for 04;
- validation per wave;
- expected 04b depth (narrow / standard / classic);
- 04 risk-handoff seed per risky wave: the structured invariant table above, with concrete search patterns, adjacent surfaces, required proof/test, owner layer, and failure signal for stage 04 to check before handing off;
- launch/manual-action implications;
- any profile-review corrections.

Stop for confirmation before `04_implementation`.
