---
name: tms-loop-review
description: "Pipeline stage 04b — independent iterative review controller for one task by ID; audits the task-owned diff with fresh M/E/R/C-scaled reviewers, automatically runs repeat 04 and a new 04b attempt when remediation is needed, and writes an atomic PASS/non-PASS status"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
  - TodoWrite
---

Run pipeline stage **04b_loop_review** for `$1`, immediately after `04_implementation` and before `05_test_report`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for task paths, validation commands, output language, follow-up/launch rules, and Git safety.

## Mandatory run and depth

04b is the default for every task. A user may explicitly skip it, but `SKIPPED` is not equivalent to acceptance and cannot proceed to 05 under the normal gate.

Scale review depth by the highest wave profile:

- **M:** one narrow independent diff review; re-review after fixes.
- **E:** standard independent review with evidence-map completeness.
- **R/C:** broad first pass over all relevant risk classes, batched fixes, and a fresh final reviewer. The 3-review/2-fix checkpoint limits one attempt only; it is hidden from reviewers and never lowers quality. Exhaustion automatically routes implementation work to repeat 04, then starts a fresh 04b attempt.

## Resolve exact task scope

1. Prefer the `base_sha`, task-owned path manifest, untracked paths, and fingerprints recorded by stage 04. Compare them with `git status --short`, staged/unstaged diffs, and task-owned untracked content.
2. Use a committed range only for legacy tasks completed under an older commit policy or when the user explicitly requests standalone review.
3. Fail closed as `BLOCKED` when task ownership or overlap is ambiguous. Unrelated staged files are a blocker.

Give every reviewer the exact base/range and task-owned paths, but no parent reasoning.

Read `02_design.md`, `03_delivery_plan.md`, and `04_implementation.md`. Treat the 04b handoff as orchestrator-only author input to audit, not as proof and not as reviewer context.

## Handoff completeness audit

Check whether the claimed file list matches the diff, risk invariants cover every dangerous surface, sibling decisions/read-write paths were omitted, risky identifiers or status fields bypass the owner layer, mocks still model an old contract, or green tests hide an untested coupled path. Expand only to directly coupled surfaces tied to the contract, diff, or risk trigger.

For every scoring pass, build a sanitized reviewer brief from the design, canonical R-ID ledger, exact current diff/path scope, current fingerprint, neutral invariant labels/surfaces, repository constraints, and validation expectations. Never attach the full author handoff, `04_implementation.md`, or `04b_loop_review.md`; exclude author searches/results, defects found/fixed, suspected bugs, scores, fix explanations, attempt/remediation history, and acceptance state. Rebuild the brief after every implementation change.

For R/C, the first reviewer must cover all relevant classes in breadth before stopping: auth/session/tenant scope, PII/privacy, money, lifecycle, concurrency/atomicity, migrations/RPC/RLS, queues/jobs, notifications/outbox/external effects, tests/mocks/fixtures, and rollout/manual gates.

## Reviewer isolation and shared canon

Read and apply `../tms-loop-code-review/references/review-canon.md`.

Each scoring pass uses a **fresh** read-only `Agent` with a self-contained prompt and no prior findings, scores, fixes, round number, remaining budget, or acceptance target. Use a balanced strong tier for M/E and the strongest available reasoning tier for R/C. Never use Fast mode.

Never tell a reviewer the 9.5 threshold or ask it to produce `PASS`. It reports evidence and a fitness score; the lead owns the gate.

## Remediation boundary and automatic repeat 04

Trigger remediation when at least three unique verified Class A/B defects exist, the same R/X invariant reopens, or two review rounds expose new verified systemic defects across multiple owner layers. A low score alone is not a trigger.

When implementation work remains:

1. Persist the current attempt as `**Status:** NEEDS_REMEDIATION` with a bounded brief: findings, R/X IDs, owner layers, and required tests.
2. Invoke `tms-implement` in automatic remediation mode inside the same session. Append `Remediation cycle N` to `04_implementation.md`, fix and validate the owned defects, recalculate fingerprints, and refresh the orchestrator-only handoff. Never stage or commit.
3. Set 04b back to `NOT_ACCEPTED`, start `Attempt N+1`, rebuild the sanitized reviewer brief with remediation history removed, and spawn a fresh independent reviewer without sending an intermediate completion response.
4. Continue until atomic `PASS`, explicit user interruption/skip, or a genuine blocker. A counter, token concern, context compaction, low score, or another remediation cycle is not a blocker.

If only fresh validation/review evidence is missing and implementation is unchanged, start a fresh evidence attempt without an unnecessary repeat 04.

## Fail-closed status and artifact

At the start of every attempt, and before/together with every implementation/test/SQL/contract/config fix, set `docs/$1/04b_loop_review.md` to `**Status:** NOT_ACCEPTED`. Never leave stale `PASS` visible while changing the accepted fingerprint.

The first field under the header must be exactly one of:

- `**Status:** PASS`
- `**Status:** NOT_ACCEPTED`
- `**Status:** SKIPPED`
- `**Status:** NEEDS_REMEDIATION`
- `**Status:** BLOCKED`

Record scope, profile/depth, attempt, handoff audit, reviewer/fix rounds, breadth, R/X/V evidence, fingerprints, scores, fixes, remediation links, and deferred items with their external capture locations.

Stage 04b never stages or commits. Accepted changes remain for stage 05/06 and the single closing commit after successful 06.

## Atomic PASS gate

Write `PASS` only as the last artifact update after all conditions hold on the exact same final implementation fingerprint:

1. required validation passed after the last implementation change;
2. a fresh independent reviewer inspected that exact fingerprint afterward;
3. no unresolved Class A/B remains and the latest reviewer reports no actionable findings or scores at least 9.5 without contradictory findings;
4. no implementation change occurred after that reviewer;
5. artifact status and user-facing claim agree.

Any later code/test/SQL/contract/config change immediately invalidates acceptance. Return to `NOT_ACCEPTED`, rerun validation, and use a fresh reviewer.

## Final response

The first line must contain the literal normalized token `04b status: <STATUS>` and, in the project's output language, state whether stage 05 is allowed. Only `PASS` allows 05.

Then briefly state reviewer waves, findings, fixes, and why that many waves were needed. Never use completion wording for any non-PASS state. Never ask the user to relaunch 04; the active 04b session owns remediation. Stop for confirmation before 05 only after `PASS`.
