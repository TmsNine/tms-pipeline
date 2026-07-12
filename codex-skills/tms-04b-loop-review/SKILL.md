---
name: tms-04b-loop-review
description: "Pipeline stage 04b — independent iterative review controller for one task by ID; reviews the task-owned diff with fresh M/E/R/C-scaled reviewers, automatically runs a separate repeat 04 and a new 04b attempt in the same session when remediation is needed, writes PASS/NOT_ACCEPTED/SKIPPED/NEEDS_REMEDIATION/BLOCKED to 04b_loop_review.md, and never commits. Default next stage after every 04_implementation. Use when the user invokes /tms-loop-review TASK-ID or wants to run 04b for a ticket in a clean window."
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

Run pipeline stage **04b_loop_review** for `$1` — the bounded independent iterative code-review-and-fix loop that sits right after `04_implementation` and before `05_test_report`. Normal pipeline input is the complete uncommitted task-owned diff left by stage 04. Committed-diff resolution exists only for legacy tasks or an explicitly standalone review.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for project specifics: task-folder path (`docs/<TASK-ID>/`), validation commands, output language (this project: user-facing prose in Russian), commit/safety rules (never auto-push; no AI attribution).

## Default 04b Policy

`04b_loop_review` is the default next stage after **every** `04_implementation`. It is not reserved only for high-risk waves. Even a small change can hide a defect: copy can change legal/billing meaning, a UI tweak can break state, and a small route edit can open a tenant gap.

Depth uses the M/E/R/C profile from `03_delivery_plan.md`:

- **M:** one narrow fresh independent diff review; any code/test fix requires one fresh re-review.
- **E:** the M rule plus an explicit audit of evidence-map completeness and unexamined zones.
- **R/C:** one broad first pass, batched fixes, and a fresh final reviewer. `MAX_REVIEW_ROUNDS = 3` and `MAX_FIX_ROUNDS = 2` are the per-attempt orchestration checkpoint, not a quality target. Exhaustion ends that attempt only; it never lowers the bar or ends the user's 04b invocation. The controller automatically runs a separate repeat 04 when implementation work remains, then starts a new 04b attempt with a fresh per-attempt budget.

A user may consciously skip 04b only by explicit instruction. A skip is not a silent gap: write `docs/$1/04b_loop_review.md` with status `SKIPPED`, the reason, and a marker that this task's independent review is owed to the next full-project audit.

## Subagent Authorization (Codex)

A user invocation of this skill/stage is explicit authorization to use the independent reviewers and subagents described by this skill. Do not treat the general multi-agent tool rule (spawn only on explicit user request) as a reason to skip a required reviewer/fix/re-review loop. If multi-agent tools are genuinely unavailable, record the limitation in the artifact, run the strongest local substitute review, and state the reduced confidence in the final summary.

## Step 0 — resolve the review scope for `$1`

Do not infer scope from the whole dirty worktree. Determine the exact task-owned scope in this order and state which you used:

1. **Normal pipeline scope:** read `base_sha`, task-owned path manifest and fingerprints from `04_implementation.md`; compare `git status --short`, `git diff`, `git diff --cached`, and every task-owned untracked file. Fail closed if task ownership or overlap is ambiguous. Existing unrelated staged files are a blocker because reviewers/final commit could mistake them for task scope.
2. **Legacy committed scope:** only when stage 04 was completed under the old policy or the user requested standalone review, resolve the task commit/range and state why the exception applies.
3. **Mixed legacy scope:** review the union only when every task-owned path is unambiguous; otherwise stop `BLOCKED`.

Pass the resolved concrete scope into every reviewer prompt: base SHA, explicit task-owned paths, untracked files, and exact commands (`git diff <base_sha> -- <paths>` or a documented legacy commit range). The reviewer must inspect the files and diff itself; the scope tells it where to look without leaking parent reasoning.

Read `docs/$1/02_design.md` (the contract), `docs/$1/03_delivery_plan.md` (waves/profiles), and `docs/$1/04_implementation.md` (implementation + self-check evidence + 04b handoff if present). Start from those artifacts as the task source of truth, but treat the stage-04 risk map/handoff as **untrusted author input**, not as complete coverage. Do not re-explore unrelated project surfaces without a concrete review reason.

## Step 0b — audit the stage-04 risk map before trusting it

If `04_implementation.md` contains a `04b handoff`, first check whether the handoff is complete enough to use. If it is missing, stale, or too narrow, record that limitation and build your own minimum risk map from `02_design.md`, `03_delivery_plan.md`, the diff, and targeted searches.

The 04b orchestrator must explicitly audit the handoff's completeness, then express any needed coverage as neutral invariant/surface checks in the sanitized reviewer brief. Ask:

- Do the changed files and diff match the file list and scope claimed by stage 04?
- Do the risk invariants cover every dangerous surface named by design/plan: auth/JWT/session, tenant scope, PII/privacy, money/billing, lifecycle/state machine, migrations, queues/jobs, notifications/outbox, external integrations?
- Are there sibling routes/resolvers/services/read paths/write paths that make the same business decision but were not checked?
- Are there direct risky reads such as stale claims, externally supplied tenant/user identifiers, status fields, or payment identifiers outside the owner layer?
- Are tests/mocks/fixtures still modelling the old contract, making validation incomplete?
- Did stage 04 over-trust green targeted tests while leaving a directly coupled path untested?

If the handoff is incomplete, expand the sanitized reviewer scope just enough to cover the missing directly coupled surfaces, and state the expansion in `04b_loop_review.md`. This is not permission for a full repo audit; the expansion must be tied to the task contract, diff, or a risk trigger.

The orchestrator audits the full author handoff, but never forwards it to a scoring reviewer. Build a sanitized reviewer brief from `02_design.md`, the canonical R-ID ledger, repository constraints, the exact current diff/path scope, current implementation fingerprint, neutral invariant labels/surfaces, and validation expectations. Exclude author searches/results, defects found/fixed, suspected bugs, scores, fix explanations, attempt/remediation history, and acceptance state. Do not attach `04_implementation.md` or `04b_loop_review.md` wholesale. Rebuild this brief from the current state after every implementation change; tell the reviewer the neutral scope may be incomplete and ask it to search for omitted directly coupled risks.

## First Reviewer Breadth Requirement

For Profile R/C tasks, the first independent reviewer must search for **all major classes of actionable defect in one broad pass**, not stop after the first interesting issue. The prompt must explicitly ask for coverage across the relevant risk classes: auth/session/tenant scope, PII/privacy, money/billing, lifecycle/state machine, concurrency/atomicity, migrations/RPC/RLS, queues/jobs, notifications/outbox/external effects, tests/mocks/fixtures, and rollout/manual gates.

If the first reviewer reports only a single issue on a broad high-risk diff, treat that as useful but incomplete unless the reviewer also states that it checked the other relevant classes and found no actionable findings.

## Remediation Boundary

Track review-loop health, not only the final score.

- A reviewer score alone never triggers remediation and never proves acceptance. Judge concrete verified findings and invariants.
- Trigger remediation when at least three unique verified Class A/B defects exist, the same R/X invariant reopens after a fix, or two review rounds expose new verified systemic defects across multiple owner layers. Count verified defects, not raw reviewer bullets or duplicates.
- When a trigger holds, stop only the current attempt as `NEEDS_REMEDIATION`; do not continue 04-style hardening inside that review attempt. Write a compact brief with findings, R/X-IDs, owner layers and mandatory tests, then immediately execute the automatic repeat-04 controller below. This applies equally to staged and end-to-end execution; never request a manual repeat-04 command.
- If the checkpoint is exhausted without acceptance and implementation work remains, use the same automatic repeat-04 path. If the implementation is unchanged and only fresh validation/review evidence is missing, set `NOT_ACCEPTED` and immediately start a fresh 04b evidence attempt without an unnecessary repeat 04. Never convert exhaustion into `PASS` and never end the session solely because a checkpoint was reached.

## Automatic Repeat-04 Controller

An invocation of this skill authorizes the full internal cycle `04b attempt → repeat 04 remediation → fresh 04b attempt`. The normal staged pause does not apply inside this cycle.

1. Set `**Status:** NEEDS_REMEDIATION` and persist the failed attempt plus a bounded remediation brief in `04b_loop_review.md` before changing implementation.
2. Invoke/apply `tms-04-implement` in automatic remediation mode in the same main-agent session. Append `Remediation cycle N` to `04_implementation.md`; fix all verified in-scope defects at their owning layers, update the necessary tests, run the applicable 04 self-checks and validation, recalculate fingerprints, and refresh the orchestrator-only author handoff. Never stage or commit.
3. When repeat 04 completes, set 04b to `NOT_ACCEPTED`, record `Attempt N+1`, rebuild the sanitized reviewer brief from the current contract/plan/diff/fingerprint with all remediation history removed, and start immediately with a fresh per-attempt checkpoint and a fresh independent reviewer. Do not send an intermediate user-facing completion message.
4. Continue cycling without a fixed remediation-cycle cap until the atomic `PASS` gate succeeds, the user explicitly interrupts/skips, or a genuine blocker prevents meaningful progress. A counter, token concern, context compaction, low score, or the mere existence of another remediation cycle is not a blocker.
5. If blocked, set `BLOCKED` and name the concrete external authority, missing product/architecture decision, scope ambiguity, unavailable independent isolation/required validation, or other non-progress condition. Never translate `BLOCKED` into a request for the user to manually rerun 04.

## Loop mechanics, scoring rubric & reviewer prompt

Read and apply `../tms-94-loop-code-review/references/review-canon.md`; it is the shared authority for safety, reviewer isolation, prompt shape, A/B/C/D findings, triage, validation and acceptance. This stage adapter owns task scope, M/E/R/C depth, per-attempt checkpoint, R/X/V ledgers, automatic repeat-04 control, remediation status, artifact and final staged stop. Do not load the full standalone `tms-94-loop-code-review/SKILL.md` for pipeline 04b unless a concrete standalone-only question requires it.

Key invariants: each reviewer is a **fresh** read-only subagent given no parent reasoning. Prefer the global `tms_reviewer` role / Terra high for M/E and `tms_risk_reviewer` / Sol xhigh for R/C; fallbacks are `gpt-5.4` and `gpt-5.5` respectively. Use a role selector only when the actual spawn schema exposes it. With the current schema, use `fork_turns: "none"`, embed the complete role in the prompt, and record `custom_role_enforced = false` plus actual model as runtime-selected/unknown. Never tell the reviewer the round number, remaining review/fix budget, previous findings/fixes/scores, `9.5` threshold, or that it should produce `PASS`; the reviewer reports evidence and a score, while the main agent owns the gate. Never use Ultra for a scoring reviewer and never use Fast mode. Treat findings as input, verify them, fix genuine issues at the owning layer, validate after each fix batch, and re-spawn only within the per-attempt checkpoint.

Use fail-closed write order. At the start of a new/reopened attempt, set the artifact status to `NOT_ACCEPTED` before review work begins. Before or together with every implementation/test/SQL/contract/config fix, set it back to `NOT_ACCEPTED`; never leave a stale `PASS` visible while the accepted fingerprint is being changed. Write `PASS` only as the last artifact update after the atomic closure check succeeds.

For Profile M, the reviewer prompt may be narrow, but it must still be independent and diff-based. Profile E must include coverage completeness. Profile R/C must explicitly stress-test the dangerous surface, not only verify that known findings were closed.

## Artifact (mandatory — always write it)

Write `docs/$1/04b_loop_review.md`:

- **Header:** stage `04b_loop_review`, date, task ID, resolved scope (worktree / commit sha(s) / range), reviewed profile(s), review depth (narrow / standard / classic), and whether the stage-04 handoff was present and complete enough to use.
- **Status:** make the first field under the header `**Status:** <STATUS>`, where `<STATUS>` is exactly one of `PASS`, `NOT_ACCEPTED`, `SKIPPED`, `NEEDS_REMEDIATION`, or `BLOCKED`; then give the reason and attempt number. `PASS` means all atomic closure conditions below hold; `NOT_ACCEPTED` means the current attempt is unfinished or a post-review implementation change still awaits validation/fresh review. Do not encode the normalized status only inside prose.
- For a run: attempt number, review/fix rounds, first-reviewer breadth/completeness, R-ID status and any append-only `X-04b-*` risks, verified A/B count, scores, final acceptance signal, batched fixes, V-ID results/fingerprints, remediation-cycle links into `04_implementation.md`, and deferred findings with their external capture location. `NEEDS_REMEDIATION` is an honest persisted attempt state before automatic repeat 04, not a normal terminal handoff to the user; always remain before 05 until a later attempt reaches `PASS`.
- For a skip: the reason + the deferral-to-next-audit marker.

## Follow-up & closing

Any actionable finding you deliberately do NOT fix in-loop must land per `AGENTS.md` Future Work Capture (bundle-don't-shard; backlog row is a one-line index) — not left only in `04b_loop_review.md`. Any manual/pre-launch action surfaced goes to the launch playbook per Pre-Launch Manual Action Capture.

Stage 04b never stages or commits. Leave accepted fixes and artifacts in the task-owned working-tree package for stage 05/06 and the one closing commit after a successful stage 06.

Before writing `PASS` or sending the final response, perform one atomic closure check on the exact final `implementation_fingerprint`:

1. required validation was rerun after the last implementation/test/SQL/contract/config change and passed;
2. a fresh independent reviewer inspected that exact fingerprint after the last such change;
3. no unresolved Class A/B remains and the latest reviewer either reported no actionable findings or scored at least `9.5/10` without contradicting findings;
4. the implementation fingerprint is unchanged after that review;
5. the artifact status and the user-facing claim agree.

Any implementation change after the final reviewer invalidates acceptance immediately. Set `NOT_ACCEPTED`, name what must be rerun, and do not proceed to 05. Before replying, reread the artifact status and recompute/verify the fingerprint; if evidence conflicts, fail closed to the appropriate non-PASS status.

The final user-facing summary after 04b must start with the literal normalized token
`04b status: <STATUS>` and, in the project's output language, state whether stage 05 is allowed.
Only `PASS` allows 05. Use `NEEDS_REMEDIATION` as a user-facing line only when the user explicitly
interrupts or asks for status during the internal cycle; do not voluntarily stop there.

Only after that first line, briefly state:

- how many fresh reviewer waves/rounds ran;
- what the reviewers found, grouped or compressed by wave when there were multiple waves;
- what was fixed in response;
- why that many waves were needed (for example: risk-heavy surface, heavy fix-loop, repeated false-success findings, or final confirmation after fixes).

Never use completion or acceptance wording for `NOT_ACCEPTED`, `SKIPPED`, `NEEDS_REMEDIATION`, or `BLOCKED`.

Keep this concise and in the project's user-facing language. If 04b was explicitly skipped, state the skip reason and owed-review marker instead of the wave summary. Never ask the user to relaunch stage 04 after remediation; the active 04b session owns that transition.

Then stop for confirmation before `05_test_report` (staged execution).
