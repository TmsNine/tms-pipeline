---
name: tms-plan
description: "Pipeline stage 03 — delivery plan split into waves with multi-agent escort profiles"
argument-hint: "<TASK-ID>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

Run pipeline stage **03_delivery_plan** for `$1`.

> **Model tier.** This stage is structured decomposition over an already-frozen design contract (02 approved, 02b audited), driven by explicit escort-profile rules — not open-ended architectural judgement. A cheaper/faster model tier is sufficient and recommended here (e.g. Sonnet rather than Opus). Keep the top tier for `02_design` / `02b_gap_audit`. Since this is main-loop lead work, switch the session model down (`/model`) before running this stage and back up for `02_design`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for project specifics: task-folder path, the exact Profile-C escort triggers (which paths/surfaces force full escort), output language.

## Method

1. **Inspect the task folder first.** List/check `docs/<TASK-ID>/` and verify that `02_design.md` and `02b_gap_audit.md` actually exist before making any claim about stage readiness. A user request to "do 03 / plan" implies the gap audit may already be complete; never assume it is missing without checking the folder.
2. **Read** `02_design.md` (with folded Class A/B fixes) + `02b_gap_audit.md`. If `02b_gap_audit.md` is missing, stop and report that `03_delivery_plan` is blocked by the missing previous-stage artifact; do not create the plan and do not silently run gap audit unless the user explicitly asks for stage 02b.
3. **Split the work into waves.** Each wave is the smallest coherent unit that can be implemented and proven together. For each wave, pre-classify the multi-agent escort profile it will run under in `04_implementation`:
   - **A — Minimal** (Dev + Tester + Reviewer): rename/move/non-behavioural refactor, copy/i18n/styling, tests-only, closeout.
   - **B — Standard** (+ Architect): non-trivial logic/services/workflows, API shape changes, new data-flow UI, schema/migration WITHOUT auth/RLS/tenant.
   - **C — Full** (+ Security): any wave hitting the project's Profile-C triggers (auth/authz/JWT/session, RLS/tenant-scoping/id resolution, trust-boundary input validation, secrets/signing/webhook verify, payments, PII/cross-tenant, new mutating command surface).
4. For each wave record: scope, files, acceptance criteria, escort profile + trigger reason.
5. Write `<task-folder>/03_delivery_plan.md`.

Stop for confirmation before `04_implementation` (staged execution).

## Closing — hand off in a clean context window

After this stage's artifact is written and confirmed, the final message to the user MUST end with a clear hand-off telling them to start the next stage in a **fresh context window** (so the next stage gets only what it needs, not this stage's noise):

> ✅ Stage 03_delivery_plan complete. Start **04_implementation** in a clean context window:
> - **Claude Code:** run `/clear`, then `/tms-implement <TICKET-ID>`
> - **Codex:** run `/clear` (or `/new`), then `/tms-implement <TICKET-ID>`
