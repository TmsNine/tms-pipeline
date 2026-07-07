---
name: tms-04b-loop-review
description: "Pipeline stage 04b — independent iterative loop code-review-and-fix for one task by ID; resolves the task's diff (committed or working-tree), runs fresh read-only reviewers until ≥9.5/10 or no actionable findings, writes 04b_loop_review.md. Default next stage after every 04_implementation; review depth scales by risk. Use when the user invokes /tms-loop-review TASK-ID or wants to run 04b for a ticket in a clean window."
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

Run pipeline stage **04b_loop_review** for `$1` — the independent iterative code-review-and-fix loop that sits right after `04_implementation` and before `05_test_report`. This is the **stage entry point invocable by task ID in a clean window**: unlike `/tms-loop-code-review` (which only inspects the *uncommitted* worktree), this skill first **resolves the task's implementation diff by ID** — so it works even after the implementation was already committed.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for project specifics: task-folder path (`docs/<TASK-ID>/`), validation commands, output language (this project: user-facing prose in Russian), commit/safety rules (never auto-push; no AI attribution).

## Default 04b Policy

`04b_loop_review` is the default next stage after **every** `04_implementation`. It is not reserved only for high-risk waves. Even a small change can hide a defect: copy can change legal/billing meaning, a UI tweak can break state, and a small route edit can open a tenant gap.

Depth scales by risk:

- **Direct / small tasks:** one narrow independent diff review against the request and acceptance; fix if needed.
- **Ordinary bounded features:** independent review, fix round for actionable findings, and fresh re-review.
- **Risk-heavy surfaces** (auth/RLS/tenant scope, payments/payroll, PII/privacy, migrations, lifecycle/state machines, queues/jobs, Telegram/outbox, external integrations): classic iterative review/fix loop until no actionable findings or score ≥ 9.5/10 with validation green.

A user may consciously skip 04b only by explicit instruction. A skip is not a silent gap: write `docs/$1/04b_loop_review.md` with status `SKIPPED`, the reason, and a marker that this task's independent review is owed to the next full-project audit.

## Subagent Authorization (Codex)

A user invocation of this skill/stage is explicit authorization to use the independent reviewers and subagents described by this skill. Do not treat the general multi-agent tool rule (spawn only on explicit user request) as a reason to skip a required reviewer/fix/re-review loop. If multi-agent tools are genuinely unavailable, record the limitation in the artifact, run the strongest local substitute review, and state the reduced confidence in the final summary.

## Step 0 — resolve the review scope for `$1`

Do NOT assume the diff is in the worktree. Determine the scope in this order and state which you used:

1. **Uncommitted worktree changes** — run `git status --short`. If there are staged/unstaged/untracked source changes clearly belonging to `$1` (touching files named in `docs/$1/03_delivery_plan.md` / `04_implementation.md`, or matching the ticket), review those via `git diff`, `git diff --cached`, and the untracked files.
2. **Committed but unpushed** — if the worktree is clean (implementation already committed), find the task's commit(s): `git log --oneline --grep="$1" -i` (also try the branch name / the migration or file names listed in `04_implementation.md`). Review the aggregate diff of those commits: `git show <sha>` for a single commit, or `git diff <first-parent>^..<last-sha>` for a range. Confirm with the user if multiple unrelated commits match.
3. **Mixed** — some committed, some still in the worktree: review the union (committed task diff + current worktree diff).

Pass the resolved concrete scope (explicit file list + how to obtain the diff — `git show <sha>` / `git diff A..B`) into every reviewer prompt, because a clean worktree gives a fresh reviewer nothing to inspect on its own. The reviewer must still read the changed files and diff itself; you only tell it *where* the diff is.

Read `docs/$1/02_design.md` (the contract), `docs/$1/03_delivery_plan.md` (waves/profiles), and `docs/$1/04_implementation.md` (implementation + self-check evidence + 04b handoff if present). Start from those artifacts as the task source of truth, but treat the stage-04 risk map/handoff as **untrusted author input**, not as complete coverage. Do not re-explore unrelated project surfaces without a concrete review reason.

## Step 0b — audit the stage-04 risk map before trusting it

If `04_implementation.md` contains a `04b handoff`, first check whether the handoff is complete enough to use. If it is missing, stale, or too narrow, record that limitation and build your own minimum risk map from `02_design.md`, `03_delivery_plan.md`, the diff, and targeted searches.

The 04b reviewer must explicitly verify the handoff's completeness, not merely follow it. Ask:

- Do the changed files and diff match the file list and scope claimed by stage 04?
- Do the risk invariants cover every dangerous surface named by design/plan: auth/JWT/session, tenant scope, PII/privacy, money/payroll, lifecycle/state machine, migrations, queues/jobs, Telegram/outbox, external integrations?
- Are there sibling routes/resolvers/services/read paths/write paths that make the same business decision but were not checked?
- Are there direct risky reads such as stale JWT claims, external `schoolId`/`studentId`, status fields, or payment identifiers outside the owner layer?
- Are tests/mocks/fixtures still modelling the old contract, making validation incomplete?
- Did stage 04 over-trust green targeted tests while leaving a directly coupled path untested?

If the handoff is incomplete, expand the reviewer scope just enough to cover the missing directly coupled surfaces, and state the expansion in `04b_loop_review.md`. This is not permission for a full repo audit; the expansion must be tied to the task contract, diff, or a risk trigger.

Every reviewer prompt must include both the author handoff and the instruction that it may be incomplete. The reviewer should use it as a starting hypothesis to verify/refute, not as a boundary that prevents finding omitted risks.

## First Reviewer Breadth Requirement

For Profile R/C tasks, the first independent reviewer must search for **all major classes of actionable defect in one broad pass**, not stop after the first interesting issue. The prompt must explicitly ask for coverage across the relevant risk classes: auth/session/tenant scope, PII/privacy, money/payroll, lifecycle/state machine, concurrency/atomicity, migrations/RPC/RLS, queues/jobs, Telegram/outbox/external effects, tests/mocks/fixtures, and rollout/manual gates.

If the first reviewer reports only a single issue on a broad high-risk diff, treat that as useful but incomplete unless the reviewer also states that it checked the other relevant classes and found no actionable findings.

## Heavy-Fix Loop Escalation

Track review-loop health, not only the final score.

- If the first two 04b reviewer scores are both below `8.5/10`, assume the implementation is under-hardened rather than merely under-reviewed. Stop the narrow fix cycle, write a compact remediation brief, and run a 04-style hardening pass against that brief before restarting 04b with a fresh reviewer.
- If 04b has already found `3+` blocker-like or incident-like actionable defects (data duplication/loss, cross-tenant exposure, money/PII error, unsafe lifecycle transition, swallowed internal failure, or launch-blocking migration/rollout issue), warn the user that the stage has become a heavy fix-loop and name the operational reason.
- When the defect count is high, prefer a structured **repeat-04 remediation cycle**: 04b writes the technical brief (defects, invariants, owner layers, required tests, validation), the main agent performs a mono/main-agent hardening pass as stage-04-style work, then 04b restarts from a fresh independent review. Do not keep applying tiny patches indefinitely when the pattern shows a weak stage-04 implementation.

## Loop mechanics, scoring rubric & reviewer prompt

Use the full methodology defined in the sibling **`tms-loop-code-review`** skill (`SKILL.md` in the same skills directory) — it is the shared canon for: the golden-middle scoring rubric (9.5 = correct + complete per contract + right-sized + clear; penalise BOTH over- and under-engineering), subagent context isolation, the self-contained reviewer prompt template, the fix→validate→re-review loop, and the acceptance signal (≥9.5/10 OR explicit no-actionable-findings, with local validation green). Do not restate or fork that canon here; read it and apply it. The only additions this stage layers on top are Step 0 (diff resolution by ID) above, depth-by-risk, and the mandatory artifact below.

Key invariants: each reviewer is a **fresh** Codex subagent via `spawn_agent` with `fork_context: false`, read-only (enforced by prompt), given no parent reasoning; use `gpt-5.4/gpt-5.5` high for ordinary review and `gpt-5.5` xhigh for auth/RLS/payments/PII/migration/lifecycle/tenant risk. Treat findings as input, fix genuine issues at the owning layer (no child-side compensation), validate after each fix, and re-spawn a new reviewer until the acceptance signal holds with validation green.

For Direct / small tasks, the reviewer prompt may be narrow, but it must still be independent and diff-based. For risk-heavy tasks, the reviewer prompt must explicitly stress-test the dangerous surface, not only verify that known findings were closed.

## Artifact (mandatory — always write it)

Write `docs/$1/04b_loop_review.md`:

- **Header:** stage `04b_loop_review`, date, task ID, resolved scope (worktree / commit sha(s) / range), reviewed profile(s), review depth (narrow / standard / classic), and whether the stage-04 handoff was present and complete enough to use.
- **Status:** `PASS` (accept signal reached) or `SKIPPED` (explicit operator skip only) — with reason.
- For a run: number of loop iterations, first-reviewer breadth/completeness result, risk-map completeness result (accepted / expanded / missing, with why), loop-health assessment (scores, blocker-like defect count, whether repeat-04 hardening was triggered or not), final reviewer acceptance signal + score, what was fixed (file/line + why), findings intentionally deferred (with reason + where captured — backlog ID per `AGENTS.md` Future Work Capture if actionable), and validation commands + results.
- For a skip: the reason + the deferral-to-next-audit marker.

## Follow-up & closing

Any actionable finding you deliberately do NOT fix in-loop must land per `AGENTS.md` Future Work Capture (bundle-don't-shard; backlog row is a one-line index) — not left only in `04b_loop_review.md`. Any manual/pre-launch action surfaced goes to the launch playbook per Pre-Launch Manual Action Capture.

If 04b changed code, tests, docs, backlog, or launch-playbook entries and the final review acceptance signal holds with validation green, create a task-scoped 04b commit by default, unless the user or project instructions explicitly say not to commit. Stage only files that clearly belong to `$1`; never stage unrelated user changes. If the task-owned subset is ambiguous, leave the commit unmade, report the exact dirty paths, and ask for a decision. Use a concise task-prefixed message, for example `$1: address review findings`. Never auto-push and never add AI/agent attribution.

Then stop for confirmation before `05_test_report` (staged execution).
