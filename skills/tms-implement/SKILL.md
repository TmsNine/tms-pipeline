---
name: tms-implement
description: "Pipeline stage 04 — profile-aware Claude implementation: inline main-agent work for M, bounded evidence/test assistance for E, real proving-role mobs for R/C, validation, risk handoff, follow-up and launch capture; also supports automatic remediation re-entry from active 04b"
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

Run pipeline stage **04_implementation** for `$1` with execution depth selected by the approved M/E/R/C profile. Do not buy a full mob for bounded work, and do not collapse risk-heavy work into one agent merely to save context.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for task paths, validation, follow-up and launch rules, output language, and repository safety.

Read and use `references/task-fingerprint.mjs` for every implementation/package fingerprint. Do not substitute an ad-hoc `git diff` hash. Keep separate UTF-8 manifests for implementation paths and the full task package, and record helper version `tms-task-fingerprint-v1`, scope, source (`worktree` or `index`), `base_sha`, manifest path, and output.

## Automatic remediation re-entry

When an active `tms-loop-review` attempt routes verified defects back to repeat 04:

- treat its remediation brief as the bounded input; do not reopen completed product/design decisions;
- append `Remediation cycle N` to `04_implementation.md`;
- fix all verified in-scope defects at the owning layers and update required tests;
- rerun the relevant proving roles and validation, recalculate fingerprints, and refresh the 04b handoff;
- never stage or commit;
- return directly to the same 04b invocation without asking the user to restart stage 04.

The next 04b reviewer must be fresh and must not receive prior reviewer reasoning, scores, round budget, or fix explanations.

## Scope and evidence setup

1. Read `00_ticket.md`, approved `02_design.md`, `02b_gap_audit.md`, and `03_delivery_plan.md`.
2. Record `base_sha`, a task-owned path manifest, and the starting implementation/package fingerprints. Fail closed on mixed ownership.
3. Reuse the M/E/R/C profiles and canonical R-ID ledger from the plan; do not silently reclassify or redefine them.

## Profile-aware execution and model evidence

Use the profile of each wave, not one global mode:

- **M:** the lead implements inline and performs local Developer/Tester/Reviewer self-checks. Do not dispatch a coding mob.
- **E:** the lead implements inline; dispatch one bounded read-only Architect/evidence pass and a Tester to isolate the evidence map and validation output. Keep final integration and the local Reviewer self-check with the lead.
- **R:** dispatch Developer + Tester and every triggered Architect or Security/Privacy/Money proving role. Add Reviewer before the wave gate. Corrections return to Developer at the owning layer.
- **C:** use the full role set, strongest judgement tier for Architect/Security, a mandatory per-invocation strongest-available model override for Reviewer, and an explicit adversarial pass before 04b.

The user may explicitly request a lighter or heavier mode. Record the override and residual risk; never silently downgrade R/C.

The lead remains the single integration owner in every profile. The code owner is the lead for M/E and the Developer agent for R/C.

Agent defaults are defined in `agents/`: Sonnet for Developer/Tester/Reviewer and Opus for Architect/Security. Profile C must override Reviewer per invocation to the strongest available judgement model. For every dispatched role record `role | preferred model | configured/default model | actual model or runtime-selected/unknown | permission source/evidence`. `permissionMode` frontmatter applies to copied project/user agents but is ignored for plugin-shipped agents; plugin dispatches must record parent/runtime permission evidence or `parent override/unknown`, never the ignored field as enforced. Never claim a model or permission boundary that the runtime did not expose. Never use Fast mode.

## Per-wave loop

1. Resolve the active wave's profile, R-IDs, scope, acceptance and validation before editing.
2. Apply the profile route above. For every subagent, send a compact dispatch brief: task/wave ID, profile, `base_sha`, exact paths/diff command, current implementation fingerprint, owning R-IDs, neutral acceptance/invariants, allowed actions, required evidence, and explicit not-in-scope items. Do not paste the full parent conversation or unrelated artifacts.
3. Keep the lead as integration owner. Use the lead as code owner for M/E and Developer as code owner for R/C.
4. Run the applicable Tester/Architect/Security/Reviewer checks. Each role rereads only the narrow evidence it must verify.
5. Verify findings before fixing. Batch related corrections at the owning layer. If a new risk trigger appears, add an append-only `X-04-*` entry and dispatch the missing role. If it meets Profile C triggers, record an execution escalation to C without rewriting the planned profile or R-ID history.
6. Rerun affected validation after every code/test/contract/SQL/config fix. A wave passes only when acceptance, applicable proving roles, and changed-surface validation are green.

## Risk-surface sweep and validation ledger

For R/C waves, inspect directly coupled producer/consumer, read/write, sibling routes, auth/tenant boundaries, migrations, queues, external effects, and tests/mocks/fixtures. Record:

- `R-ID | invariant | owner layer | required proof | result`;
- `X-04-* | newly exposed risk | evidence | disposition`;
- `V-ID | command/signal | scope | implementation fingerprint | result | fresh/reused | covers AC/R/X | environment | stage`.

If validation changes code/tests/contracts/SQL/config, its result is stale until rerun on the new implementation fingerprint. Pipeline-document-only edits affect the package fingerprint, not the implementation fingerprint. The canonical helper provides SHA-256 framing, bytewise path ordering, file modes, symlinks, deletions, raw content, and package-field normalization.

## Artifact and handoff

Write `docs/$1/04_implementation.md` as work progresses:

- mode and profile per wave;
- integration owner, dispatched/self-check roles, and preferred/configured/actual model evidence;
- files and behavior changed;
- R/X/V ledgers and fingerprint history;
- deviations and fixes;
- an orchestrator-only `04b handoff` containing the task-owned diff scope, author risk map, dangerous invariants, required tests, adjacent surfaces, and known residuals.

The 04b handoff is author input, not proof. Stage 04b audits it, then derives a sanitized neutral reviewer brief; it never forwards the handoff, author findings/fixes, searches/results, suspicions, scores, or remediation history wholesale to a scoring reviewer.

## Mandatory capture

Before leaving stage 04:

- consolidate actionable follow-ups into the project's backlog using bundle-don't-shard;
- write every manual pre-launch action into the correct launch-playbook document with executable steps and pass criteria.

## Git and stop

Stage 04 never stages or commits. Leave the complete task-owned working-tree package for 04b, 05, and the one closing commit after successful 06.

Name follow-ups, launch-playbook additions, validation, profiles, and what 04b must stress-test. Stop for confirmation before 04b unless this was automatic remediation inside an already active 04b invocation.
