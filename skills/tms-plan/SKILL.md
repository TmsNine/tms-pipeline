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
5. **Plan review gate (adversarial — mandatory before finalizing).** Submit the draft to a picky reviewer: spawn a separate read-only review sub-agent (`Agent`, `subagent_type: general-purpose`, `model: opus`) with a self-contained prompt, OR make one explicit review pass with the planner's hat OFF and a skeptic's hat ON (treat the plan as someone else's work). The reviewer exists to catch exactly the failure this gate is for — a wave's escort profile silently under-classified. Rubric:
   - **Re-derive every wave's escort profile from scratch.** Do NOT trust the planner's label. For each wave, enumerate the project's full Profile-C trigger list (auth/authz/JWT/session, RLS/tenant-scoping/id resolution, trust-boundary input validation, secrets/signing/webhook verify, payments/commerce, PII/cross-tenant, new mutating command surface) and mark each fires / doesn't-fire with a one-line reason grounded in that wave's actual files and scope.
   - **Burden of proof is on every downgrade.** Classifying a wave below Profile C (no Security agent) is valid only if the wave survives EVERY trigger explicitly. "Mirrors an existing pattern", "small surface", "tenant-scoping already verified", "just a length check" do NOT license a downgrade when the wave introduces or modifies trust-boundary input validation, persists or displays PII / user free-text, or touches a payment/commerce surface. Those run Profile C regardless of how small the diff is.
   - **Honour the chosen product option, not the rejected lighter one.** When an interview choice created the surface (e.g. owner chose to *persist* a free-text note → a new PII-bearing column + new validation), the escort profile must reflect the chosen heavier option, not the lighter rejected one.
   - **On any disagreement, default to the stricter profile.** Never rationalise a downgrade. If reviewer and planner split, the wave gets the heavier escort.
   - Also sanity-check: each wave is the smallest coherent provable unit; dependencies/order correct; acceptance criteria observable; every Class A/B fix folded into `02_design.md`; every audit follow-up + pre-launch manual action carried into a wave or the closeout; no scope inflation beyond the contract.
   - Fold the reviewer's corrections in before writing. If any escort profile changed, also correct the stale one-line note in `01_research.md` / `02_design.md` / `02b_gap_audit.md` so the artifacts don't contradict the plan.
6. Write `<task-folder>/03_delivery_plan.md` (post-review version).

Stop for confirmation before `04_implementation` (staged execution).

## Closing — hand off in a clean context window

After this stage's artifact is written and confirmed, the final message to the user MUST end with a clear hand-off telling them to start the next stage in a **fresh context window** (so the next stage gets only what it needs, not this stage's noise):

> ✅ Stage 03_delivery_plan complete. Start **04_implementation** in a clean context window:
> - **Claude Code:** run `/clear`, then `/tms-implement <TICKET-ID>`
> - **Codex:** run `/clear` (or `/new`), then `/tms-implement <TICKET-ID>`
