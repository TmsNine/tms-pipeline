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

Read `docs/$1/02_design.md` (the contract), `docs/$1/03_delivery_plan.md` (waves/profiles), and `docs/$1/04_implementation.md` (implementation + self-check evidence). Start from those artifacts as the task source of truth; do not re-explore unrelated project surfaces without a concrete review reason.

## Loop mechanics, scoring rubric & reviewer prompt

Use the full methodology defined in the sibling **`tms-loop-code-review`** skill (`SKILL.md` in the same skills directory) — it is the shared canon for: the golden-middle scoring rubric (9.5 = correct + complete per contract + right-sized + clear; penalise BOTH over- and under-engineering), subagent context isolation, the self-contained reviewer prompt template, the fix→validate→re-review loop, and the acceptance signal (≥9.5/10 OR explicit no-actionable-findings, with local validation green). Do not restate or fork that canon here; read it and apply it. The only additions this stage layers on top are Step 0 (diff resolution by ID) above, depth-by-risk, and the mandatory artifact below.

Key invariants: each reviewer is a **fresh** Codex subagent via `spawn_agent` with `fork_context: false`, read-only (enforced by prompt), given no parent reasoning; use `gpt-5.4/gpt-5.5` high for ordinary review and `gpt-5.5` xhigh for auth/RLS/payments/PII/migration/lifecycle/tenant risk. Treat findings as input, fix genuine issues at the owning layer (no child-side compensation), validate after each fix, and re-spawn a new reviewer until the acceptance signal holds with validation green.

For Direct / small tasks, the reviewer prompt may be narrow, but it must still be independent and diff-based. For risk-heavy tasks, the reviewer prompt must explicitly stress-test the dangerous surface, not only verify that known findings were closed.

## Artifact (mandatory — always write it)

Write `docs/$1/04b_loop_review.md`:

- **Header:** stage `04b_loop_review`, date, task ID, resolved scope (worktree / commit sha(s) / range), reviewed profile(s), review depth (narrow / standard / classic).
- **Status:** `PASS` (accept signal reached) or `SKIPPED` (explicit operator skip only) — with reason.
- For a run: number of loop iterations, final reviewer acceptance signal + score, what was fixed (file/line + why), findings intentionally deferred (with reason + where captured — backlog ID per `AGENTS.md` Future Work Capture if actionable), and validation commands + results.
- For a skip: the reason + the deferral-to-next-audit marker.

## Follow-up & closing

Any actionable finding you deliberately do NOT fix in-loop must land per `AGENTS.md` Future Work Capture (bundle-don't-shard; backlog row is a one-line index) — not left only in `04b_loop_review.md`. Any manual/pre-launch action surfaced goes to the launch playbook per Pre-Launch Manual Action Capture. If you changed code, follow the project commit rules (create the commit only when the project flow/user asks; never auto-push; no AI attribution). Then stop for confirmation before `05_test_report` (staged execution).
