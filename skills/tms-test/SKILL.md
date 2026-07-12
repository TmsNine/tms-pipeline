---
name: tms-test
description: "Pipeline stage 05 — test report; validate the primary user-visible signal plus secondary checks on the exact accepted implementation fingerprint"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

Run pipeline stage **05_test_report** for `$1`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for task paths, canonical validation commands, output language, and manual-check rules.

For fingerprints, read and run the canonical helper from the sibling `../tms-implement/references/task-fingerprint.mjs`. Require helper version `tms-task-fingerprint-v1`; never recreate the hash with an ad-hoc command.

## Method

1. Read `02_design.md`, `03_delivery_plan.md`, `04_implementation.md`, and `04b_loop_review.md`.
2. Require the normalized 04b status to be exactly `PASS`. A `NOT_ACCEPTED`, `SKIPPED`, `NEEDS_REMEDIATION`, or `BLOCKED` artifact cannot enter stage 05.
3. Recalculate the task-owned **implementation fingerprint** from the implementation manifest with the canonical helper in `worktree` mode and require it to match the accepted 04b fingerprint. Compute the broader **package fingerprint** from its separate manifest with the same helper. The helper owns package-field normalization, so writing stored fingerprint values does not make the hash self-referential.
4. Identify the **primary signal**: the cheapest decisive user-visible/runtime proof. Automated proxies alone are insufficient when the real behavior can be checked.
5. Run the smallest meaningful changed-surface checks, cheapest first. Record each as `V-ID | command/signal | scope | implementation fingerprint | result | fresh/reused | covers AC/R/X | environment | stage`.
6. Treat non-zero exits, timeouts, runtime errors, failed assertions, type/lint/build errors, or unexpected source mutations as failures. Escalate ambiguous failures to diagnosis; do not reinterpret red as green.
7. When a required manual check cannot run locally, record the exact scenario, precondition, steps, pass criterion, and launch-playbook location. Keep the verdict honest.
8. Write `docs/$1/05_test_report.md` with the primary-signal result, secondary checks, V-IDs, fingerprint match, manual gates, failures, and coverage gaps.

## Stop

Stop after the report. Do not issue the stage-06 verdict.
