---
name: tms-04-implement
description: "Run pipeline stage 04 (implementation) for a backlog task in a project that follows the 9-stage delivery pipeline. Implement the approved plan wave by wave with profile-aware M/E/R/C role separation, scope-drift control, per-wave validation, an R/C readiness floor before independent 04b, follow-up and launch capture; also supports bounded remediation re-entry from active 04b. Use when the user asks to 'do 04', 'implement', 'реализуй' a pipeline task by ID with an approved 03_delivery_plan, or when tms-04b-loop-review routes verified defects back to repeat 04. Also match the legacy command /tms-implement."
---

# Stage 04 — Implementation

Read THIS project's `AGENTS.md` (Codex reads it natively) for specifics: task-folder path, security-sensitive surfaces, commit conventions, backlog location, launch-playbook location + stage→doc mapping, output language. In Codex shell sessions do not assume JS tooling is on PATH (prefer `PATH="/opt/homebrew/bin:$HOME/.bun/bin:$PATH"`).

Use the zero-dependency canonical helper in `references/task-fingerprint.mjs` for every implementation/package fingerprint. Do not substitute an ad-hoc `git diff` hash. Resolve the helper relative to this skill, keep separate UTF-8 manifests for implementation paths and the full task package, and record helper version `tms-task-fingerprint-v1`, scope, source (`worktree` or `index`), `base_sha`, manifest path, and output. Stage 06 must prove the worktree and staged-index package hashes match.

Start from `docs/<TASK-ID>/03_delivery_plan.md` and the approved previous-stage artifacts as the source of truth. Do not re-read broad project docs or unrelated code unless the active wave needs it for a concrete decision, validation, or risk check.

## Automatic Remediation Re-entry From 04b

When an active `tms-04b-loop-review` invocation routes a failed review attempt back to stage 04, run stage 04 in remediation mode in the same main-agent session. This is a real separate repeat of 04, not another fix round disguised as review and not a new user command.

- Take the verified remediation brief, R/X-IDs, owner layers, required tests and latest implementation fingerprint from `04b_loop_review.md` as the bounded input; keep `02_design.md` and `03_delivery_plan.md` as the contract.
- Append `Remediation cycle N` to `04_implementation.md`; preserve prior stage history and state which verified defects caused re-entry.
- Fix the implementation shape at the owning layers, update the necessary tests, rerun the profile-required coding/proving roles and changed-surface validation, recalculate fingerprints, and refresh the 04b handoff.
- Do not stage or commit. Do not ask the user for confirmation between repeat 04 and the next 04b attempt.
- Return control directly to the same 04b invocation. The next scoring reviewer must still be fresh and must not receive the previous reviewer reasoning, scores, round budget or fix explanation.

Stop and return `BLOCKED` to the 04b controller only for a real unresolved product/architecture choice, ambiguous task ownership, unavailable required validation, destructive/external authority, or another condition that prevents meaningful in-scope implementation. A completed remediation cycle is never a reason to stop for user confirmation.

## Profile-Aware Codex Execution Model

Select execution per wave from `03_delivery_plan.md`. Do not collapse R/C proving roles into one main-agent self-review merely to save context.

- **M:** the lead is code and integration owner. Implement inline and perform local Developer/Tester/Reviewer self-checks; do not buy a coding mob.
- **E:** the lead remains code owner. Dispatch one bounded read-only Architect/evidence pass and `tms_validator`/equivalent Tester for the active wave; keep integration and the local gate with the lead.
- **R:** assign exact active-wave file ownership to a dedicated Developer worker. Dispatch Validator/Tester and every triggered Architect or Security/Privacy/Money proving role, then a fresh stage-04 wave Reviewer. The lead integrates, verifies findings and resolves conflicts; it does not substitute its own hats for required roles.
- **C:** use the full R role set for every wave classified C. If the task is C as a whole, treat every implementation wave as C unless the approved plan records a specific evidence-backed lower-risk exception. The lead orchestrates and integrates rather than acting as the sole code author. Use strongest judgement for Architect/Security and the wave Reviewer, and run a fresh adversarial cross-wave integration review before 04b.

When configured roles exist, prefer `tms_developer`, `tms_architect`, `tms_security`, `tms_wave_reviewer` and `tms_validator`. Otherwise dispatch a fresh `worker`/read-only subagent with the complete role prompt and record the fallback. Every coding worker must receive exact ownership and be told that other work may coexist, to preserve unrelated changes and accommodate current state.

If the user explicitly requests a lighter mode, record the override and residual risk. Never silently downgrade R/C. A Profile C mono-only override cannot claim the normal stage-04 readiness gate unless a fresh independent substitute proves the same coverage.

## Stage-04 Profiles And Models

Use the M/E/R/C definitions and R-ID ledger from `03_delivery_plan.md`; do not redefine or relabel profiles in stage 04. Prefer Terra high for M/E lead work and R/C Developer work, Luna medium for known validation, Terra medium/high for evidence/architecture, and Sol high/xhigh for Profile-C architecture/security/reviewer judgement. Escalate the Developer to Sol only for a genuinely difficult C branch; do not spend the strongest model on routine code or log collection. Fallbacks: Luna → `gpt-5.4-mini`, Terra → `gpt-5.4`, Sol → `gpt-5.5`. Record preferred versus actual/unknown runtime model when selection cannot be enforced. Never use Fast mode; Max is not a normal implementation default and Ultra is not used for scoring review.

## Sequential Wave Discipline

Implement delivery-plan waves strictly in order. Do not start coding or validation for wave N+1 until wave N has passed its local gates and `04_implementation.md` records its outcome.

Before the first implementation edit, record `base_sha` and the task-owned path manifest. Do not start while another uncommitted pipeline implementation occupies the same worktree; use a separate worktree or obtain an explicit owner decision. Unrelated pre-existing changes may remain only when their paths do not overlap and cannot enter this task's scope.

After each wave compare the actual task-owned paths, owner layers and risk triggers with the plan's scope-drift baseline. Stop stage 04 with an explicit `REPLAN_REQUIRED` marker in `04_implementation.md` when the implementation adds an unplanned trust boundary/owner layer/profile trigger, or when the task-owned path set grows materially (default signal: more than 25% beyond the planned paths) without a bounded same-owner explanation. Do not quietly turn 04 or repeat-04 into redesign. During automatic remediation, return this marker to the 04b controller as terminal `NEEDS_REMEDIATION`; do not start another review attempt.

Allowed parallelism is limited to normal local tool use for the active wave: independent read-only searches, test commands, and file reads. Do not overlap different plan waves to save time. If the delivery plan appears to invite parallel waves, treat that as sequencing ambiguity and choose the listed order unless the user explicitly approves a different order.

## Risk Transfer From Stages 00-03

Before editing each Profile R/C wave, read the owning R-IDs from `03_delivery_plan.md` and add only their current status/evidence to `04_implementation.md`. Do not copy or rewrite the canonical invariant descriptions. For M/E, use the real ledger entries or `none` from the plan.

If implementation exposes a material risk absent from the plan, append an `X-04-*` entry with owner layer, required proof and failure signal. Keep the original R-ID meanings unchanged so planning misses stay visible.

Risk prompts:

- Money/subscription/billing: no duplicate charge/refund, lost fulfillment, wrong settlement, or split business path across entrypoints.
- Tenant/auth/RLS: no cross-tenant access; direct client writes cannot bypass server-side authorization; role and capability semantics match the product contract.
- Lifecycle/state machine: every entrypoint reaches the same owner layer; illegal transitions fail before side effects; retries repair partial state without duplicates.
- Persistence/concurrency: DB writes that must be one business action are atomic or explicitly ordered; competing actions serialize or return a safe conflict.
- Async/external effects: notifications, jobs, payments, and audits happen after the durable state they describe, with retry/idempotency behavior.
- Migration/rollout: new code has required schema/RPC/policy first; verification SQL exists for privileges, policies, triggers, indexes, and function bodies when relevant.

Passing a risk-bearing wave requires every owning R/X-ID to be mapped to evidence. An invariant can be satisfied by a test, a static migration smoke, a real launch check, or a documented no-code rationale, but it cannot disappear between `03_delivery_plan` and `04_implementation`.

## Risk-Surface Sweep Before 04b Handoff

For Profile R/C waves, do a bounded local sweep before closing stage 04. Use the R/X search map rather than restating a second risk ledger. The goal is to reduce obvious misses before the fresh stage-04 Reviewer and 04b, not to certify the implementation.

Use the canonical risk ledger from `03_delivery_plan.md` plus the actual diff to search for:

- sibling routes/resolvers/services that make the same permission, tenant, money, lifecycle, or identity decision outside the newly changed owner layer;
- direct risky reads such as externally supplied roles, tenant/user identifiers, lifecycle status, payment/billing identifiers, free-text notification content, or migration constraint names, depending on the task;
- test harnesses/mocks/fixtures that still model the old contract and would make neighboring suites fail or hide regressions;
- producer/consumer or read/write paths not named in the plan but directly coupled to the changed contract.

Record what was searched and what was found in `04_implementation.md`. If a search finds a relevant adjacent surface, either align it in 04 or explicitly list it for 04b stress-test. Do not turn this sweep into open-ended auditing; stop when the planned risky symbols and directly coupled surfaces have been checked.

## Stage-04 Readiness Gate Before 04b

Before closing each R/C wave, run a fresh read-only stage-04 Reviewer on the current wave fingerprint. After all Profile C waves, run another fresh adversarial cross-wave integration review. These proving reviews are part of implementation and do not replace independent 04b; do not reuse them as 04b scoring evidence.

For each R/X-ID, the lead and proving Reviewer check and record:

- the required proof/test was actually added or the no-code proof is explicit;
- the owner layer owns the decision, with no duplicate fallback in a child/leaf layer;
- the failure signal would be observable in tests, SQL smoke, launch checks, logs, or user-visible behavior;
- directly coupled routes/resolvers/services/tests/mocks from the risk search map were inspected;
- any defect found in this pass was fixed before stage 04 closed;
- no unresolved A/B or systemic C finding remains;
- the fresh Reviewer scores the wave/final integration at least `8.0/10` without contradictory findings.

All acceptance, R/X evidence and required changed-surface validation must be green on the same implementation fingerprint. If the Reviewer scores below `8.0`, reports A/B or systemic C, or exposes a planning/scope miss, stage 04 is not ready: fix within the active wave or stop `REPLAN_REQUIRED`. Do not punt author-stage defects to 04b merely because 04b exists.

## Per-Wave Loop

1. Read `03_delivery_plan.md`, take the next unfinished wave in listed order, confirm scope and acceptance, and record the wave profile. Verify the previous wave is recorded as passed before doing any work on this one.
2. For Profile R/C, perform Risk Transfer before editing. For Profile M/E, record the short reason why the smaller profile is valid.
3. Route the wave by profile. For R/C, dispatch the Developer with exact file ownership; for E/R/C, dispatch the required proving roles with narrow context. Preserve unrelated user changes. Do not add production dependencies without explicit approval.
4. Run the **Developer check**: smallest coherent diff, no scope inflation, no duplicated business path, no unrelated formatting churn.
5. Run the **Tester/Validator check**: targeted failing/green tests where practical, then the cheapest meaningful validation for the changed surface. If a suitable automated test is disproportionate, state why and use the fastest reliable substitute signal.
6. Run the **Architect check** when required: producer/consumer contracts, read/write paths, migrations/RPC/order, state transitions, async/idempotency, and adjacent surfaces directly coupled to the change.
7. Run the **Security / Privacy / Money check** when triggered: tenant scope, trusted identity provenance, role guard, trust-boundary validation, PII/audit, payment/billing semantics, external effects.
8. Run the fresh **stage-04 Reviewer gate** required by the profile. Compare the wave diff to `02_design.md` and `03_delivery_plan.md`; look for missed invariants, races, unsafe fallbacks and missing tests; enforce the R/C `8.0/10` floor.
9. If any role/check fails, verify and batch related corrections at the owning layer, then rerun affected roles and validation. Do not advance on red.
10. Write/update `docs/<TASK-ID>/04_implementation.md` as the stage proceeds: wave profile, R/X status updates, risk-surface sweep notes, self-check roles applied, files changed, validation, failures/fixes, follow-ups, launch items, and what 04b must independently stress-test.
11. Record each validation as `V-ID | signal/command | scope | implementation_fingerprint before/after | result | fresh/reused | covers AC/R/X | environment | stage`. The implementation manifest contains only code/tests/contracts/SQL/config; the package manifest contains the full repo-local task package including pipeline docs. The canonical helper provides SHA-256 framing, bytewise path ordering, file modes, symlinks, deletions, raw content, and package-field normalization. External documentation-base state is excluded and tracked separately. If a command changes the implementation fingerprint, its result is invalid until rerun.

## Context And Token Discipline

- Use the previous artifact as the task source of truth; avoid re-reading the whole project unless the wave needs it.
- Keep each dispatched role on the active wave's exact paths, invariants and required evidence. M stays inline; E uses bounded help; R/C uses real coding/proving-role separation.
- Break oversized waves into smaller sub-waves instead of doing vague large edits.
- Do not pre-scout or pre-implement later waves while the active wave is still open.
- Keep `04_implementation.md` dense: outcome by wave, evidence, checks, follow-ups, launch actions, residual risk. Do not re-tell the whole project.

## 04b Handoff (mandatory before closing stage 04)

Before the final stage-04 summary, add a compact `04b handoff` section to `docs/<TASK-ID>/04_implementation.md`. This handoff is an **author's risk map**, not proof of completeness. It exists to help the 04b orchestrator resolve and audit scope. It is never forwarded wholesale to a scoring reviewer; 04b must derive a sanitized neutral reviewer brief without author findings, fixes, searches/results, suspicions, scores, or remediation history.

Include:

- `base_sha`, resolved task-owned path manifest, implementation fingerprint, package fingerprint, and exact worktree commands 04b should inspect;
- wave/profile summary and the dangerous invariants by wave;
- exact searches/risk-surface sweeps performed in 04 and their results;
- stage-04 readiness result: per-wave proving roles, Reviewer score/fingerprint, invariant table status, defects found/fixed, scope-drift comparison, and any invariant intentionally left for 04b to stress-test;
- adjacent routes/resolvers/services/tests/mocks checked or intentionally not checked, with the reason;
- validation commands and remaining manual/launch checks;
- orchestrator stress-test prompts: what 04b should include when deriving neutral surfaces/invariants, including areas the author thinks are probably safe; do not forward the author's wording or suspicions to the reviewer.

Do not claim the handoff is exhaustive. Phrase it as: "author risk map for 04b to verify and complete". If stage 04 skipped a plausible adjacent surface because it seemed out of scope, name it so 04b can decide independently whether to pull it in.

## Closing (mandatory — BOTH, before the turn ends)

**A. Follow-up capture.** Consolidate every follow-up into the project backlog per `AGENTS.md` rules: bundle, don't shard; drop trivia; fold into existing bundles for the same surface/source/domain before creating new; the row is a one-line index. Follow-ups left only in `04_implementation.md` are lost.

**B. Pre-launch manual-action capture.** Any manual step a human must do before/at launch that a test cannot — apply a migration, set an env key, a live/browser/staging smoke, configure an external service, a scheduler/cron check, a deploy-ordering constraint, a UAT step, a `conditional_go` gate — MUST be written into the project's launch playbook, in the stage-matching document, with exact steps, copy-pasteable command/SQL, precise pass criterion, precondition, and where to look if it fails. Vague lines are the failure mode this prevents.

## Git boundary

Stage 04 never stages or commits. Leave the complete task-owned implementation diff available for independent 04b and the later single closing commit after a successful stage 06. If task ownership becomes ambiguous or another task overlaps the same paths, stop rather than creating a partial checkpoint.

## Closing summary

Name the stage-04 mode, profile and actual coding/proving roles per wave, scope-drift result, R/C Reviewer score/fingerprint, the 04b handoff status, which backlog bundles received follow-ups (with IDs), and which launch-playbook document received which manual item (with migration numbers if any). For a normal user-invoked 04, stop for confirmation before `04b_loop_review`. For an automatic remediation repeat owned by an already active 04b invocation, return control directly only when the readiness gate passes; on `REPLAN_REQUIRED`, stop the 04b invocation as terminal `NEEDS_REMEDIATION`.
