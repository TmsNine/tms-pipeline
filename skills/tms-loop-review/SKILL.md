---
name: tms-loop-review
description: "Pipeline stage 04b — independent iterative loop code-review-and-fix for one task by ID; resolves the task's diff (committed or working-tree), runs fresh read-only reviewers until ≥9.5/10 or no actionable findings, writes 04b_loop_review.md. Use when the user invokes /tms-loop-review TASK-ID or wants to run 04b for a ticket in a clean window."
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

## Step 0 — resolve the review scope for `$1` (the new, essential part)

Do NOT assume the diff is in the worktree. Determine the scope in this order and state which you used:

1. **Uncommitted worktree changes** — run `git status --short`. If there are staged/unstaged/untracked source changes clearly belonging to `$1` (touching files named in `docs/$1/03_delivery_plan.md` / `04_implementation.md`, or matching the ticket), review those via `git diff`, `git diff --cached`, and the untracked files.
2. **Committed but unpushed** — if the worktree is clean (implementation already committed), find the task's commit(s): `git log --oneline --grep="$1" -i` (also try the branch name / the migration or file names listed in `04_implementation.md`). Review the aggregate diff of those commits: `git show <sha>` for a single commit, or `git diff <first-parent>^..<last-sha>` for a range. Confirm with the user if multiple unrelated commits match.
3. **Mixed** — some committed, some still in the worktree: review the union (committed task diff + current worktree diff).

Pass the resolved concrete scope (explicit file list + how to obtain the diff — `git show <sha>` / `git diff A..B`) into every reviewer prompt, because a clean worktree gives a fresh reviewer nothing to inspect on its own. The reviewer must still read the changed files and diff itself; you only tell it *where* the diff is.

Read `docs/$1/02_design.md` (the contract) and `docs/$1/03_delivery_plan.md` / `04_implementation.md` (waves + escort profiles) to know what the change was supposed to be and which waves ran.

## Conditional-run & skip rules (stage 04b policy)

- **Run the full loop only for Profile B or C waves** (real business logic, contracts, auth/RLS/payments/PII). For **Profile A**-only work (renames, copy, styling, docs, tests-only, non-behavioural refactor) the loop adds little over `06_review_gate` — record `04b skipped — Profile A, no behavioural change` in the artifact and stop. If a task mixed profiles, run the loop scoped to the B/C waves' surface only.
- **Operator may consciously skip** any task's 04b (e.g. no token budget). A skip is not a silent gap: write `docs/$1/04b_loop_review.md` with status `SKIPPED`, the reason, and a marker that this task's deep review is **owed to the next full-project audit** (`tms-audit-*`), which sweeps all committed code by construction.
- This loop **fixes** code; it is NOT the gate. `06_review_gate` independently judges design conformance afterward. A reviewer that fixed code cannot also be the final sign-off.

## Loop mechanics, scoring rubric & reviewer prompt

Use the full methodology defined in the sibling **`tms-loop-code-review`** skill (`SKILL.md` in the same skills directory) — it is the shared canon for: the golden-middle scoring rubric (9.5 = correct + complete per contract + right-sized + clear; penalise BOTH over- and under-engineering), subagent context isolation, the self-contained reviewer prompt template, the fix→validate→re-review loop, and the acceptance signal (≥9.5/10 OR explicit no-actionable-findings, with local validation green). Do not restate or fork that canon here; read it and apply it. The only additions this stage layers on top are Step 0 (diff resolution by ID) above and the mandatory artifact below.

Key invariants (from that canon): each reviewer is a **fresh** `Agent` (`subagent_type: general-purpose`, `model: opus`), read-only (enforced by prompt), given no parent reasoning; you treat findings as input, fix genuine issues at the owning layer (no child-side compensation), validate after each fix, and re-spawn a new reviewer until the accept signal holds with validation green.

## Artifact (mandatory — always write it)

Write `docs/$1/04b_loop_review.md`:
- **Header:** stage `04b_loop_review`, date, task ID, resolved scope (worktree / commit sha(s) / range), escort profile(s) of the reviewed waves.
- **Status:** `PASS` (accept signal reached) or `SKIPPED` (Profile A or operator skip) — with reason.
- For a run: the number of loop iterations, the final reviewer acceptance signal + score, what was fixed (file/line + why), findings intentionally deferred (with reason + where captured — backlog ID per `AGENTS.md` Future Work Capture if actionable), and validation commands + results.
- For a skip: the reason + the deferral-to-next-audit marker.

## Follow-up & closing

Any actionable finding you deliberately do NOT fix in-loop must land per `AGENTS.md` Future Work Capture (bundle-don't-shard; backlog row is a one-line index) — not left only in `04b_loop_review.md`. Any manual/pre-launch action surfaced goes to the launch playbook per Pre-Launch Manual Action Capture. If you changed code, follow the project commit rules (create the commit; never auto-push; no AI attribution). Then stop for confirmation before `05_test_report` (staged execution).
