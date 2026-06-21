---
name: tms-implement
description: "Pipeline stage 04 — mandatory multi-agent mob implementation with wave-by-wave gates, follow-up + launch capture"
argument-hint: "<TASK-ID>"
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

Run pipeline stage **04_implementation** for `$1` via **mandatory multi-agent mob programming**. The lead (you) does NOT write source code — you orchestrate parallel subagents (`Agent` tool, `subagent_type: general-purpose`) and enforce quality gates. Skip the multi-agent flow only if the user explicitly says "implement inline" / "no subagents".

Read THIS project's `AGENTS.md` / `CLAUDE.md` for project specifics: task-folder path, the exact Profile-C escort triggers, commit conventions, backlog location, launch-playbook location + stage→doc mapping, output language.

## Per-wave loop (from `03_delivery_plan.md`)

1. **Classify the wave's escort profile and record it + the trigger reason** as a one-line note at the top of the wave section in `04_implementation.md`:
   - **A — Minimal:** Dev + Tester + Reviewer. Rename/move/non-behavioural refactor, copy/i18n/styling, tests-only, closeout.
   - **B — Standard:** + Architect. Non-trivial logic/services, API shape changes, new data-flow UI, schema/migration WITHOUT auth/RLS/tenant.
   - **C — Full:** + Security. ANY project Profile-C trigger (auth/authz/JWT/session, RLS/tenant-scoping/id resolution, trust-boundary input validation, secrets/signing/webhook verify, payments, PII/cross-tenant, new mutating command surface). Non-negotiable on these triggers.
   Default to the smallest profile the triggers allow — never run full escort "to be safe". Escort profile is the primary cost lever.
2. **Dispatch the Developer** agent with the wave brief (scope, files, acceptance).
3. **Dispatch the proving roles for the profile IN PARALLEL** (single message, multiple Agent calls): A = Tester + Reviewer; B = + Architect; C = + Security.
   - Tester: build / tests / types / lint green.
   - Architect (B/C): no design drift from `02_design.md` / `03_delivery_plan.md`.
   - Security (C): no new vulnerabilities (auth, input validation, OWASP, tenant scoping, secret leakage).
   - Reviewer: matches plan + acceptance criteria.
4. **Wave passes only if every spawned check is green.** On failure: spawn a focused fix agent with the specific findings, re-run only the failed gates. Do not advance.
5. **Escalate, never downgrade:** if a Minimal/Standard wave surfaces a Profile-C trigger mid-wave, spawn the missing Security (and Architect) agent before passing the gate.
6. Keep lead context lean (target ≥20% headroom); split a wave into sub-waves if it overloads. Write `04_implementation.md` as you go.

## Closing (mandatory — BOTH, before the turn ends)

**A. Follow-up capture.** Consolidate every follow-up / postponed item / deferred decision discovered during implementation into the project backlog per its rules: bundle, don't shard; drop trivia; check existing open bundles for the same surface/source/domain and fold into them before creating new; the backlog row is a one-line index (details in the ticket). Follow-ups left only in `04_implementation.md` are lost.

**B. Pre-launch manual-action capture.** Any manual step a human must perform before/at launch that an automated test cannot — applying a migration, setting an env key, a live/browser/staging smoke, configuring an external service, a scheduler/cron check, a deploy-ordering constraint, a UAT step, a `conditional_go` gate condition — MUST be written into the project's launch playbook, in the stage-matching document, with: the exact step sequence, the copy-pasteable command/SQL, the precise pass criterion ("expect 1 row", "no Seq Scan", "message arrives"), the precondition (which migration/env first), and where to look if it fails. Vague lines ("run the smoke", "apply the migrations") are the failure mode this exists to prevent.

## Commit rules

After all waves pass their gates, create the commit(s). **NEVER** add `Co-Authored-By:` or any AI/agent attribution. Do **not** push automatically — the branch waits for human review and CI.

## Closing summary

Name which backlog bundles received which follow-ups (with IDs) and which launch-playbook document received which manual item (with migration numbers if any). Then stop for confirmation before `05_test_report` (staged execution).

## Closing — hand off in a clean context window

After this stage's artifact is written and confirmed, the final message to the user MUST end with a clear hand-off telling them to start the next stage in a **fresh context window** (so the next stage gets only what it needs, not this stage's noise):

> ✅ Stage 04_implementation complete. Start **05_test_report** in a clean context window:
> - **Claude Code:** run `/clear`, then `/tms-test <TICKET-ID>`
> - **Codex:** run `/clear` (or `/new`), then `/tms-test <TICKET-ID>`
