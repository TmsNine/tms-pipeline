---
name: tms-implement
description: "Pipeline stage 04 — mandatory Claude multi-agent mob implementation with M/E/R/C-scaled proving roles, validation, risk handoff, follow-up and launch capture; also supports automatic remediation re-entry from active 04b"
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

Run pipeline stage **04_implementation** for `$1` via Claude Code's multi-agent mob. The lead orchestrates; Developer agents write source. Skip the mob only when the user explicitly requests inline implementation.

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

## Per-wave loop

1. **Dispatch Developer** with one wave's scope, files, acceptance, profile, R-IDs, and validation.
2. **Dispatch proving roles proportionally:**
   - **M:** Tester + Reviewer.
   - **E:** bounded Explorer/Architect evidence pass + Tester + Reviewer.
   - **R:** Tester + Architect + Security/Privacy/Money + Reviewer.
   - **C:** full role set with the strongest judgement agents and an explicit pre-04b adversarial pass.
3. Use the cheapest sufficient model for mechanical test execution and evidence maps. Keep architecture, security, privacy, money, lifecycle, and final judgement on the strongest appropriate model. Never use Fast mode.
4. Give proving roles a compact path/line/change brief. They independently reread the narrow evidence they must verify; do not make every role rediscover the whole codebase.
5. Verify findings before fixing. Batch related corrections at the owner layer. If a new risk trigger appears, add an append-only `X-04-*` entry and dispatch the missing role.
6. A wave passes only when acceptance, applicable proving roles, and changed-surface validation are green.

## Risk-surface sweep and validation ledger

For R/C waves, inspect directly coupled producer/consumer, read/write, sibling routes, auth/tenant boundaries, migrations, queues, external effects, and tests/mocks/fixtures. Record:

- `R-ID | invariant | owner layer | required proof | result`;
- `X-04-* | newly exposed risk | evidence | disposition`;
- `V-ID | command/signal | scope | implementation fingerprint | result | fresh/reused | covers AC/R/X | environment | stage`.

If validation changes code/tests/contracts/SQL/config, its result is stale until rerun on the new implementation fingerprint. Pipeline-document-only edits affect the package fingerprint, not the implementation fingerprint. The canonical helper provides SHA-256 framing, bytewise path ordering, file modes, symlinks, deletions, raw content, and package-field normalization.

## Artifact and handoff

Write `docs/$1/04_implementation.md` as work progresses:

- mode and profile per wave;
- Developer/proving roles used;
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
