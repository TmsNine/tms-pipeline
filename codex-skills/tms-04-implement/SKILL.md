---
name: tms-04-implement
description: "Run pipeline stage 04 (implementation) for a backlog task in a project that follows the 9-stage delivery pipeline. Implement the approved delivery plan wave by wave as a mono/main-agent implementation with explicit self-check roles, validation, mandatory follow-up + pre-launch manual-action capture, and stop before independent 04b review. Use when the user asks to 'do 04', 'implement', 'реализуй' a pipeline task by ID with an approved 03_delivery_plan. Also match the legacy command /tms-implement."
---

# Stage 04 — Implementation

Read THIS project's `AGENTS.md` (Codex reads it natively) for specifics: task-folder path, security-sensitive surfaces, commit conventions, backlog location, launch-playbook location + stage→doc mapping, output language. In Codex shell sessions do not assume JS tooling is on PATH (prefer `PATH="/opt/homebrew/bin:$HOME/.bun/bin:$PATH"`).

Start from `docs/<TASK-ID>/03_delivery_plan.md` and the approved previous-stage artifacts as the source of truth. Do not re-read broad project docs or unrelated code unless the active wave needs it for a concrete decision, validation, or risk check.

## Default Codex Execution Model

Stage `04_implementation` defaults to **mono/main-agent implementation**, not multi-agent mob development. The lead agent implements, integrates, validates, records artifacts, and makes the local stage-04 pass/fail decision.

This is a cost and context-control change, not a quality reduction. The main agent must still perform the self-checks that older multi-agent wave roles made explicit:

- **Developer:** implement the smallest coherent change from `03_delivery_plan.md`, wave by wave.
- **Tester:** add/update the highest-value tests and run the narrow changed-surface checks.
- **Architect:** verify owning layer, coupled read/write paths, contracts, migrations, and launch ordering.
- **Security / Privacy / Money:** verify `schoolId`/JWT provenance, tenant scope, role permissions, PII, audit, external effects, and money semantics whenever the surface touches them.
- **Reviewer:** before closing each wave, compare the diff against `02_design.md` and `03_delivery_plan.md`, looking for missed invariants, duplicated business paths, unsafe fallbacks, races, and missing tests.

Full multi-agent implementation inside 04 is allowed only when the operator intentionally chooses the heavier mode for an exceptional risk surface. If the user explicitly requests mono/no-subagent execution, respect it and record the limitation/risk in `04_implementation.md`.

## Stage-04 Profiles

Profiles now describe **risk and 04b depth**, not automatic mob-agent development inside 04.

### Profile M — Mono / bounded

Use when the implementation surface is bounded, the design/plan is clear, tests are available, and blast radius is limited. The main agent implements and self-checks. `04b` still runs after 04.

### Profile E — Evidence-assisted

Use when the main uncertainty is finding code evidence. `gpt-5.4-mini` explorer may be used for read-only evidence lookup (`path:line`, symbol, snippet, why it matters), but product decisions, architecture calls, security/privacy/payment judgement, and final artifacts remain with the main agent.

### Profile R — Risk review required

Use when the wave touches money/payroll, roles, school scope, PII/privacy, migrations, lifecycle/state machines, queues/jobs, Telegram/outbox, external integrations, or meaningful user-facing business logic. Stage 04 remains main-agent by default, but 04b must run as an independent review/fix loop.

### Profile C — Full classic allowed

Use when the task has maximum cost of error: payment providers, mass messaging/free-text delivery, GDPR/privacy retention, tenant isolation with high blast radius, critical migrations/backfills, complex concurrency/atomicity, webhook/security boundaries, or full-codebase audits. The operator may choose full multi-agent implementation inside 04; if not, the main-agent implementation must explicitly record why mono/main execution is acceptable and what 04b must stress-test.

Profile selection is based on the **most dangerous touched risk**, not the average size of the diff.

## Sequential Wave Discipline

Implement delivery-plan waves strictly in order. Do not start coding or validation for wave N+1 until wave N has passed its local gates and `04_implementation.md` records its outcome.

Allowed parallelism is limited to normal local tool use for the active wave: independent read-only searches, test commands, and file reads. Do not overlap different plan waves to save time. If the delivery plan appears to invite parallel waves, treat that as sequencing ambiguity and choose the listed order unless the user explicitly approves a different order.

## Risk Transfer From Stages 00-03

Before editing each Profile R/C wave, convert the approved preparation artifacts into a short implementation risk ledger in `docs/<TASK-ID>/04_implementation.md`. This is the bridge from planning to code; do not rely on memory or on the later `04b` loop to rediscover it.

Read the relevant parts of `00_ticket.md`, `01_research.md`, `02_design.md`, `02b_gap_audit.md`, and `03_delivery_plan.md`, then write 3-7 concrete invariants for the wave. Each invariant must name what must never go wrong for the user/business and how the implementation will prove it: code owner layer, regression test, migration/RLS SQL check, launch-playbook item, or explicitly deferred follow-up. If the wave truly has no systemic risk, write one line saying why.

Risk prompts:

- Money/subscription/payroll: no double charge/refund, no lost lesson, no wrong teacher pay, no split business path across entrypoints.
- Tenant/auth/RLS: no cross-school access; direct client writes cannot bypass API role rules; owner/manager/teacher/student capabilities match the product contract.
- Lifecycle/state machine: every entrypoint reaches the same owner layer; illegal transitions fail before side effects; retries repair partial state without duplicates.
- Persistence/concurrency: DB writes that must be one business action are atomic or explicitly ordered; competing actions serialize or return a safe conflict.
- Async/external effects: notifications, jobs, payments, and audits happen after the durable state they describe, with retry/idempotency behavior.
- Migration/rollout: new code has required schema/RPC/policy first; verification SQL exists for privileges, policies, triggers, indexes, and function bodies when relevant.

Passing a risk-bearing wave requires every invariant to be mapped to evidence. An invariant can be satisfied by a test, a static migration smoke, a real launch check, or a documented no-code rationale, but it cannot disappear between `03_delivery_plan` and `04_implementation`.

## Risk-Surface Sweep Before 04b Handoff

For Profile R/C waves, do a bounded local sweep before closing stage 04. This is still mono/main-agent work, not independent review. The goal is to reduce obvious misses before 04b, not to certify the implementation.

Use the risk-handoff seed from `03_delivery_plan.md` plus the actual diff to search for:

- sibling routes/resolvers/services that make the same permission, tenant, money, lifecycle, or identity decision outside the newly changed owner layer;
- direct risky reads such as `payload.schoolRole`, `schoolId`, `studentId`, `teacherId`, `user_id`, `status`, `onboarding_status`, payment/payroll identifiers, free-text notification content, or migration constraint names, depending on the task;
- test harnesses/mocks/fixtures that still model the old contract and would make neighboring suites fail or hide regressions;
- producer/consumer or read/write paths not named in the plan but directly coupled to the changed contract.

Record what was searched and what was found in `04_implementation.md`. If a search finds a relevant adjacent surface, either align it in 04 or explicitly list it for 04b stress-test. Do not turn this sweep into open-ended auditing; stop when the planned risky symbols and directly coupled surfaces have been checked.

## Pre-04b Adversarial Self-Review

Before closing stage 04 for any Profile R/C task, run one bounded adversarial self-review using the same invariant table from `03_delivery_plan.md`. This is still mono/main-agent work and does not replace independent 04b.

For each invariant, check and record:

- the required proof/test was actually added or the no-code proof is explicit;
- the owner layer owns the decision, with no duplicate fallback in a child/leaf layer;
- the failure signal would be observable in tests, SQL smoke, launch checks, logs, or user-visible behavior;
- directly coupled routes/resolvers/services/tests/mocks from the risk search map were inspected;
- any defect found in this pass was fixed before stage 04 closed.

If this self-review finds a systemic miss across multiple invariants, do a short 04 hardening pass before writing the final 04 handoff. Do not punt obvious author-found defects to 04b just because 04b exists.

## Per-Wave Loop

1. Read `03_delivery_plan.md`, take the next unfinished wave in listed order, confirm scope and acceptance, and record the wave profile. Verify the previous wave is recorded as passed before doing any work on this one.
2. For Profile R/C, perform Risk Transfer before editing. For Profile M/E, record the short reason why the smaller profile is valid.
3. Implement the wave in the owning layer. Preserve unrelated user changes. Do not add production dependencies without explicit approval.
4. Run the **Developer self-check**: smallest coherent diff, no scope inflation, no duplicated business path, no unrelated formatting churn.
5. Run the **Tester self-check**: targeted failing/green tests where practical, then the cheapest meaningful validation for the changed surface. If a suitable automated test is disproportionate, state why and use the fastest reliable substitute signal.
6. Run the **Architect self-check**: producer/consumer contracts, read/write paths, migrations/RPC/order, state transitions, async/idempotency, and adjacent surfaces directly coupled to the change.
7. Run the **Security / Privacy / Money self-check** when relevant: tenant scope, `schoolId`/JWT provenance, role guard, trust-boundary validation, PII/audit, payment/payroll semantics, external effects.
8. Run the **Reviewer self-check**: compare the wave diff to `02_design.md` and `03_delivery_plan.md`; look for missed invariants, races, unsafe fallbacks, and missing tests.
9. If any self-check fails, fix at the owning layer and rerun the relevant checks. Do not advance on red.
10. Write/update `docs/<TASK-ID>/04_implementation.md` as the stage proceeds: wave profile, risk ledger, risk-surface sweep notes, self-check roles applied, files changed, validation, failures/fixes, follow-ups, launch items, and what 04b must independently stress-test.

## Context And Token Discipline

- Use the previous artifact as the task source of truth; avoid re-reading the whole project unless the wave needs it.
- Default to mono/main-agent implementation. Use `gpt-5.4-mini` explorer only for bounded evidence lookup.
- Break oversized waves into smaller sub-waves instead of doing vague large edits.
- Do not pre-scout or pre-implement later waves while the active wave is still open.
- Keep `04_implementation.md` dense: outcome by wave, evidence, checks, follow-ups, launch actions, residual risk. Do not re-tell the whole project.

## 04b Handoff (mandatory before closing stage 04)

Before the final stage-04 summary, add a compact `04b handoff` section to `docs/<TASK-ID>/04_implementation.md`. This handoff is an **author's risk map**, not proof of completeness. It exists to make 04b faster and sharper, while explicitly remaining untrusted until 04b audits it.

Include:

- resolved task-owned file list and, if committed, the commit/range that 04b should inspect;
- wave/profile summary and the dangerous invariants by wave;
- exact searches/risk-surface sweeps performed in 04 and their results;
- pre-04b adversarial self-review result: invariant table status, defects found/fixed, and any invariant intentionally left for 04b to stress-test;
- adjacent routes/resolvers/services/tests/mocks checked or intentionally not checked, with the reason;
- validation commands and remaining manual/launch checks;
- reviewer stress-test prompts: what 04b must try to break, including any surfaces the author thinks are probably safe.

Do not claim the handoff is exhaustive. Phrase it as: "author risk map for 04b to verify and complete". If stage 04 skipped a plausible adjacent surface because it seemed out of scope, name it so 04b can decide independently whether to pull it in.

## Closing (mandatory — BOTH, before the turn ends)

**A. Follow-up capture.** Consolidate every follow-up into the project backlog per `AGENTS.md` rules: bundle, don't shard; drop trivia; fold into existing bundles for the same surface/source/domain before creating new; the row is a one-line index. Follow-ups left only in `04_implementation.md` are lost.

**B. Pre-launch manual-action capture.** Any manual step a human must do before/at launch that a test cannot — apply a migration, set an env key, a live/browser/staging smoke, configure an external service, a scheduler/cron check, a deploy-ordering constraint, a UAT step, a `conditional_go` gate — MUST be written into the project's launch playbook, in the stage-matching document, with exact steps, copy-pasteable command/SQL, precise pass criterion, precondition, and where to look if it fails. Vague lines are the failure mode this prevents.

## Commit rules

After all waves pass and stage-04 validation is green, create a task-scoped implementation commit by default, unless the user or project instructions explicitly say not to commit. This keeps later `04b` work reviewable from a clean window and avoids accumulating an unrelated dirty tree.

- Stage only files that clearly belong to `<TASK-ID>`: implementation changes, tests, migrations, `docs/<TASK-ID>/04_implementation.md`, and any required backlog / launch-playbook updates from this stage.
- Do not stage unrelated user changes. If the worktree contains mixed unrelated edits and the task-owned subset is ambiguous, leave the commit unmade, report the exact dirty paths, and ask for a decision.
- Use a concise task-prefixed message, for example `<TASK-ID>: implement <short scope>`.
- NEVER add `Co-Authored-By:` or any AI/agent attribution. Do not push automatically — the branch waits for human review and CI.

## Closing summary

Name the stage-04 mode, profile per wave, self-check roles applied, the 04b handoff status, which backlog bundles received follow-ups (with IDs), and which launch-playbook document received which manual item (with migration numbers if any). Stop for confirmation before `04b_loop_review`. `04b` is the independent loop code-review-and-fix stage and is the default next step for every task.
