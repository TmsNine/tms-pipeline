---
name: tms-loop-code-review
description: "Iterative independent code review loop for active Git changes using fresh read-only Claude subagents, verified finding triage, bounded fix rounds, repository-safe validation, and atomic acceptance on the latest fingerprint"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
  - TodoWrite
---

# Loop Code Review

Run a bounded review-and-fix loop over the active Git change set. This is the standalone workflow; pipeline-specific scope, M/E/R/C depth, automatic repeat 04, artifacts, and stage stops live in `tms-loop-review`.

Read THIS repo's `AGENTS.md` / `CLAUDE.md` for validation, language, architecture, and Git safety. Read `references/review-canon.md`; it is the shared authority for reviewer isolation, prompt shape, A/B/C/D findings, validation, and acceptance.

## Preflight

1. Confirm the repository root.
2. Capture `git status --short`, staged/unstaged name-status, and relevant untracked files.
3. Determine worktree or branch mode and the exact diff range.
4. Inspect the changed surface and repository-native validation commands.
5. Run safe focused validation when the scope is clear.

Do not stage, commit, push, reset, restore, stash, switch branches, install dependencies, update snapshots, run migrations, deploy, or contact production unless the user separately authorizes it. Preserve unrelated work.

## Independent reviewers

Every scoring pass uses a fresh `Agent` in clean subagent context. The reviewer receives only:

- repository and exact diff/path scope;
- neutral original task and acceptance criteria;
- relevant project constraints;
- read-only restrictions;
- validation expectations;
- required finding format.

It receives no parent reasoning, suspected issues, prior findings, prior scores, fix explanations, round number, remaining budget, or acceptance target.

Use a balanced strong model for ordinary review and the strongest available reasoning model for auth, permissions, tenant scope, payments, PII, migrations, lifecycle, queues, external effects, data integrity, or reviewer disagreement. Never use Fast mode for scoring.

## Loop

1. Spawn the first fresh reviewer and require broad coverage proportional to risk.
2. Verify each finding against code, contract, tests, and runtime evidence.
3. Reject false positives with evidence. Fix only verified in-scope issues at the owning layer; batch related fixes.
4. Rerun focused and affected validation.
5. After any implementation/test/contract/config change, spawn a **new** reviewer for the latest state. Clarification from the old reviewer does not count as a final scoring pass.
6. Default checkpoint: at most 3 fresh scoring reviewers and 2 meaningful fix batches in one standalone attempt. The checkpoint is hidden from reviewers and never reduces the acceptance bar.

Stop without claiming acceptance when the checkpoint is exhausted, the same issue repeats without new evidence, reviewers require irreconcilable architecture, clean isolation or validation is unavailable, a fix needs external/destructive authority, or a product decision is genuinely unresolved.

## Atomic acceptance

Accept only when required validation passes after the last implementation change, a fresh reviewer inspects that same final fingerprint, no unresolved Class A/B remains, every other actionable finding is fixed/rejected/deferred explicitly, and the latest reviewer either scores at least 9.5 or states exactly `No actionable findings or comments.`.

Any later code/test/SQL/contract/config change invalidates acceptance and requires fresh validation plus a new reviewer.

## Final report

Report:

- accepted / stopped / blocked / interrupted;
- changes made and what they protect;
- latest independent review signal and number of fresh reviewers;
- exact validation commands and results;
- rejected/deferred findings with evidence;
- remaining risks.

Before reporting, rerun `git status --short` and `git diff --check`; confirm no reviewer changed the repository and that the accepted reviewer inspected the latest state.
