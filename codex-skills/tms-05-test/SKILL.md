---
name: tms-05-test
description: "Run pipeline stage 05 (test report) for a backlog task in a project that follows the 9-stage delivery pipeline. Validate the changed surface with the cheapest meaningful gates and judge by the primary user-visible signal, not proxies. Use when the user asks to 'do 05', 'test report', 'тесты' for a pipeline task by ID. Also match the legacy command /tms-test."
---

# Stage 05 — Test report

Read THIS project's `AGENTS.md` (Codex reads it natively) for specifics: task-folder path, test runner/scripts, output language. In Codex shell sessions do not assume JS tooling is on PATH (prefer `PATH="/opt/homebrew/bin:$HOME/.bun/bin:$PATH"`).

> **Model tier.** Prefer the global `tms_validator` role / Luna medium for known checks and compact pass/fail reporting, Terra high for ambiguous failures, and Sol high only when an R/C failure needs auth/RLS/payment/PII/lifecycle judgement. Fallbacks: Luna → `gpt-5.4-mini`, Terra → `gpt-5.4`, Sol → `gpt-5.5`. Never use Fast mode. If the runtime cannot prove the requested role/model, use a generic validation prompt and record actual model as runtime-selected/unknown.

For fingerprints, read and run the canonical helper from the sibling `../tms-04-implement/references/task-fingerprint.mjs`. Require helper version `tms-task-fingerprint-v1`; never recreate the hash with an ad-hoc command.

## Method

1. **Fail closed on 04b.** Read `04b_loop_review.md` and require its normalized status field to be exactly `PASS`. `NOT_ACCEPTED`, `SKIPPED`, `NEEDS_REMEDIATION`, and `BLOCKED` cannot enter stage 05. Recalculate the current implementation fingerprint before running tests and require it to equal the fingerprint accepted by 04b; any mismatch returns the task to non-PASS 04b.
2. **Resolve validation freshness.** Read the implementation/package manifests, `base_sha`, R/X ledger and V-ID evidence from 04/04b. Compute both hashes with the canonical helper in `worktree` mode. The helper normalizes package-fingerprint evidence fields so the stored value does not hash itself. Pipeline-doc-only changes do not invalidate implementation evidence.
3. **Run the smallest meaningful validation** covering the changed surface, cheapest first: targeted tests → typecheck → lint → build → focused scripts → wider suites only if needed. Use the repo's existing infrastructure. If contracts/schemas changed, validate **both producer and consumer** sides.
   - Profile M/E may reuse a V-ID only when command, environment, implementation fingerprint and time-sensitivity match exactly.
   - Profile R/C always freshly repeats the available primary signal and at least one risk-specific task gate; this is a floor, not a cap.
   - After any 04b fix, rerun affected checks and the primary signal. If the primary signal is live/staging-only, mark it partially validated and ensure the exact manual check is in the launch playbook.
4. **Judge by the primary signal** (user-visible/runtime behavior), not proxies — green tests/lint/types alone are not success. Treat non-zero exits, runtime errors, failed assertions, type/lint/build errors, timeouts as failed validation. Do not hide failures.
5. Write `docs/<TASK-ID>/05_test_report.md`: exact checks run + what they showed, `Primary signal status` (met / not met / partially validated), `Secondary signal status`, implementation/package fingerprints, and compact V-ID rows (`fresh` / `reused` / `failed`, covering AC/R/X). If validation cannot run, say why and name the best substitute signal.

Stop for confirmation before `06_review_gate`.
