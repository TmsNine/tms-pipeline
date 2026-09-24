---
name: tms-03-plan
description: "Run pipeline stage 03 (delivery plan) for a backlog task in a project that follows the 9-stage delivery pipeline. Split the work into waves with scope, files, acceptance, profile-aware implementation roles, scope-drift triggers, stage-04 readiness gates, and 04b review depth. Use when the user asks to 'do 03', 'delivery plan', 'план' for a pipeline task by ID. Also match the legacy command /tms-plan."
---

# Stage 03 — Delivery plan

> **Model tier.** Prefer GPT-5.6 Terra high for normal plans and Luna medium for an obvious Profile-M-only mechanical plan. Use Sol high only when auth/RLS/payments/PII/lifecycle ambiguity still requires risk judgement. Fallbacks: Luna → `gpt-5.4-mini`, Terra → `gpt-5.4`, Sol → `gpt-5.5`. If the runtime cannot prove the selected model, record it as runtime-selected/unknown rather than claiming the preference was enforced. Never use Fast mode.

Read THIS project's `AGENTS.md` (Codex reads it natively) for specifics: task-folder path, risk-sensitive surfaces (auth/RLS/tenant/payments/PII/validation), output language.

Start from `02_design.md` and `02b_gap_audit.md` as the source of truth. Do not re-read broad project docs or unrelated code unless the plan needs it for a concrete risk/profile decision.

## Method

1. **Inspect the task folder first.** List/check `docs/<TASK-ID>/` and verify that `02_design.md` and `02b_gap_audit.md` actually exist before making any claim about stage readiness.
2. **Read** `02_design.md` (with folded Class A/B fixes) + `02b_gap_audit.md`. If `02b_gap_audit.md` is missing, stop and report that `03_delivery_plan` is blocked by the missing previous-stage artifact; do not create the plan and do not silently run gap audit unless the user explicitly asks for stage 02b.
3. **Split the work into waves.** Each wave is the smallest coherent unit that can be implemented and proven together.
4. For each wave record: scope, expected files/owner layers, acceptance criteria, implementation profile, risk triggers, required implementation/proving roles, code ownership, validation, stage-04 readiness gate, expected 04b depth, and the owning risk IDs.
5. Create one canonical **risk ledger** in `03_delivery_plan.md`; later stages reference it instead of restating it:
   - Profile R/C: 3–7 real invariants `R-01…R-07`.
   - Profile M/E: `none` or 1–3 real invariants; never invent risks to fill a quota.
   - Columns: `R-ID | business invariant | trigger/surface | owner layer | required proof | failure signal | owning wave | search map`.
   - Keep R-ID meaning append-only. Risks first discovered later use `X-04-*` or `X-04b-*`; do not rewrite the original R-ID to hide a planning miss.

## Implementation Profiles

Profiles select both stage-04 execution and stage-04b review depth. Do not flatten R/C into one-agent self-review merely to save context.

- **Profile M — Mono / bounded:** the lead implements and performs local Developer/Tester/Reviewer self-checks. 04b runs one fresh narrow reviewer; a code/test fix requires one fresh re-review.
- **Profile E — Evidence-assisted:** the lead implements; dispatch one bounded read-only Architect/evidence pass and a Validator/Tester. Keep integration and the local wave gate with the lead. 04b audits evidence-map completeness.
- **Profile R — Risk review required:** dispatch a Developer code owner, Validator/Tester, every triggered Architect or Security/Privacy/Money proving role, and a fresh stage-04 wave Reviewer. The lead integrates but does not substitute self-review for those roles. 04b uses an orthogonal independent reviewer set.
- **Profile C — Maximum cost of error:** use the full role set for every wave classified C; when the task is classified C as a whole, every implementation wave is C unless the plan reviewer records a specific lower-risk exception with evidence. The lead orchestrates and integrates; a dedicated Developer owns implementation; strongest judgement is reserved for Architect/Security and the wave Reviewer. Run an adversarial cross-wave integration review before 04b. Ultra is not used for scoring review.

For every R/C wave, define a **stage-04 readiness gate**: all acceptance and required validation pass on the current fingerprint; every owning R/X-ID has evidence; no unresolved A/B or systemic C finding remains; and a fresh stage-04 reviewer scores the wave/final integration at least `8.0/10` without contradictory findings. This is an author-stage quality floor, not 04b acceptance.

Record a **scope-drift baseline** from the expected paths, owner layers and risk triggers. Stage 04 must stop with `REPLAN_REQUIRED` in `04_implementation.md` when implementation introduces an unplanned trust boundary/owner layer/profile trigger, or when the task-owned path set grows materially (default signal: more than 25% beyond the planned path set). A file-count signal alone does not force replan when the owner layers and invariants are unchanged, but it must be explained.

Profile selection is based on the **most dangerous touched risk**, not average diff size. If reviewer and planner disagree, use the stricter profile.

## Plan review gate (adversarial — mandatory before finalizing)

Run one explicit skeptical pass over the draft plan. Prefer the global `tms_reviewer` role when enforceable; otherwise use a fresh generic read-only Terra/fallback reviewer, or do the pass locally with the designer's hat OFF when delegation overhead exceeds the task. The reviewer exists to catch under-classified profiles and missing 04b depth.

Rubric:

- Re-derive every wave's profile from scratch. Do NOT trust the planner's label.
- Enumerate relevant risk triggers: auth/RLS/JWT/session, tenant-scoping/id resolution, trust-boundary input validation, secrets/signing/webhook verify, payments/billing, PII/cross-tenant, migration/backfill, lifecycle/state machine, queue/job/idempotency, notifications/outbox/external effects.
- Burden of proof is on every lower-risk classification. "Small surface" or "mirrors an existing pattern" does not justify a downgrade when the wave changes a trust boundary, money, PII, tenant access, or external side effect.
- Verify that the role route is executable: M/E are not overstaffed, R/C have separate coding and proving ownership, the `8.0/10` readiness gate is explicit, and expected paths/owner layers are concrete enough to detect drift.
- Also sanity-check: waves are coherent and ordered; acceptance criteria observable; Class A/B fixes folded into `02_design.md`; audit follow-ups and pre-launch manual actions are carried into a wave or closeout; no scope inflation beyond the contract.
- Fold corrections in before writing. If profile changed, correct stale profile notes in earlier artifacts if they would otherwise contradict the plan.
- Keep execution profiles M/E/R/C distinct from finding severity A/B/C/D. A/B/C/D classifies discovered gaps; it never selects implementation mode.

## Output

Write `docs/<TASK-ID>/03_delivery_plan.md` (post-review version), including:

- wave list and order;
- implementation profile + risk trigger reason per wave;
- implementation/proving roles, code owner and lead responsibility for 04;
- expected paths/owner layers, scope-drift triggers and replan rule;
- validation per wave;
- stage-04 readiness gate and final pre-04b integration review for R/C;
- expected 04b depth (narrow / standard / classic);
- one canonical R-ID risk ledger, with each wave referencing its owning IDs;
- launch/manual-action implications;
- any profile-review corrections.

Stop for confirmation before `04_implementation`.
