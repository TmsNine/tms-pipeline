---
name: tms-review
description: "Pipeline stage 06 — review gate; verify the implementation against the design contract, require an exact 04b PASS, issue go/conditional_go/no-go, sync external status, and create one task-scoped closing commit"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

Run pipeline stage **06_review_gate** for `$1`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for task paths, external delivery/status documents, launch playbook, output language, and Git safety rules.

For fingerprints, read and run the canonical helper from the sibling `../tms-implement/references/task-fingerprint.mjs`. Require helper version `tms-task-fingerprint-v1`; never recreate the hash with an ad-hoc command.

## Method

1. Start from `02_design.md`, `03_delivery_plan.md`, `04_implementation.md`, `04b_loop_review.md`, and `05_test_report.md`. Do not redo a full 04b review when the accepted evidence is current.
2. Verify implementation against the design contract and acceptance criteria.
3. Require the normalized 04b field to be exactly `PASS`. `NOT_ACCEPTED`, `SKIPPED`, `NEEDS_REMEDIATION`, and `BLOCKED` cannot receive `go` or `conditional_go`, regardless of optimistic prose elsewhere.
4. Derive the complete changed-path set from Git state (`git diff --name-only -z --no-renames <base_sha> --` plus `git ls-files --others --exclude-standard -z`), classify every path as task-owned or unrelated, and fail closed on ambiguity/overlap. `--no-renames` is mandatory so a rename remains source deletion + destination addition before and after staging. Materialize the observed task-owned set and require exact equality with the package manifest through the helper's `--observed` input. Recalculate implementation/package fingerprints in `worktree` mode and require the implementation hash to match accepted 04b and fresh stage-05 evidence.
5. Confirm R/X ledgers, V-ID evidence, coupled contracts/read-write paths, docs, follow-ups, and pre-launch manual actions. A task is not done when only the visible symptom is gone but the owning mechanic remains inconsistent.
6. Issue `go`, `conditional_go` with explicit launch conditions, or `no-go` with reasons and the best next experiment. Write `docs/$1/06_review_gate.md` with closing-commit eligibility, but never a future commit SHA: a commit cannot contain its own final SHA.
7. Before a successful verdict is complete, update and reread the external backlog/status and launch-playbook entries named by the project. If mandatory external sync cannot be verified, stage 06 is `BLOCKED`.
8. On `go` or `conditional_go`, create exactly one closing task commit containing all and only repo-local task-owned changes from stages 00–06. Stage only manifest paths with unambiguous ownership. Derive the staged set with `git diff --cached --name-only -z --no-renames <base_sha> --`, require exact equality with the package manifest through `--observed`, then run the helper in `index` mode and require the staged package hash to equal the pre-stage `worktree` package hash. A `no-go`, `BLOCKED`, failed external sync, path-set/fingerprint mismatch, ambiguous ownership, or unrelated staged content forbids the commit. Report the actual SHA after success in chat or another external status surface; do not edit the committed review artifact merely to insert it. Never push automatically and never add AI attribution.
9. Add a compact `Pipeline metrics` block: profile; waves; review/fix rounds; A/B/C/D findings; remediation cycles; validation freshness; fingerprint match; primary signal; manual gates; available time/subagent/token data; verdict.

## Closing

Name the verdict, exact 04b status, external documents updated and reread, remaining launch conditions, and whether the single closing commit was created.
