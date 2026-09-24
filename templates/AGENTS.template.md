<!--
  AGENTS.template.md — the shared canon for the tms-pipeline delivery methodology.

  HOW TO USE THIS FILE
  1. Copy it to the root of your project as `AGENTS.md` (Codex reads it natively; Claude Code
     imports it from `.claude/CLAUDE.md` — see CLAUDE.template.md).
  2. Replace every {{PLACEHOLDER}} with your project's real value.
  3. Delete the HTML comments (like this one and the inline « » notes) once filled in — they are
     guidance, not part of the canon.
  4. The tms-* skills read THIS file at runtime to learn your project specifics, so keep it accurate.

  This is a DELIVERY methodology: it governs how an already-defined task moves from ticket to
  reviewed code. It does NOT invent features for you — bring your own backlog.
-->

# AGENTS.md

This file applies to the whole repository unless a deeper `AGENTS.md` overrides it.

## Operating Standard

- Answer in {{OUTPUT_LANGUAGE}}. «e.g. "English" / "Russian" — the language every user-facing word is written in.»
- **Audience:** the reader is {{AUDIENCE_PROFILE}}. «e.g. "a non-technical product owner" or "a senior engineer".
  Everything the user reads (chat, status, summaries, pipeline artifacts) is written for THIS audience.
  If non-technical: plain language, pair any unavoidable technical term with its practical meaning.
  Artifacts that land in source for engineers (code, comments, commit messages, test names) stay in
  English per convention regardless of audience.»
- **Quiet working mode.** During pipeline/stage work, keep reasoning in the thinking channel. Do NOT
  emit to chat: interstitial micro-summaries, step-by-step "now I will do X", re-statements, or
  decorative formatting of work-in-progress. Visible text is reserved for (1) the stage's final
  artifacts, (2) points that need a user decision (interview questions, option choices, blockers
  surfaced before acting), (3) a short final stage summary.
- Interview questions are self-contained for the target audience: describe the real scenario, why it
  matters, the day-to-day consequence of each option, then 2-3 plain-language options with a clear
  recommendation. Allow short answer codes (`1B, 2A`) but always spell out each option's meaning.
- Read relevant chat history before acting.
- Be autonomous by default: inspect, decide, implement, validate, report without unnecessary
  confirmation loops. Ask only when ambiguity blocks a safe decision, the product choice is genuinely
  open, or the action is risky/destructive/irreversible.
- Do not hallucinate; verify uncertain claims against code, scripts, docs, tests, runtime output.
- Preserve unrelated user changes — do not revert, overwrite, reformat, or clean up work you did not
  create unless asked.
- Prefer evidence over ceremony; keep process proportional to the task.

## Repository Grounding

- **Lazy-load docs.** Don't read product/delivery docs until the task needs them; search the relevant
  subfolder for the one file you need. {{DOC_INDEX_HINT}} «e.g. "The doc map is docs/INDEX.md — read
  that first." Delete this line if you have no doc index.»
- Start from the repository, not assumptions. For non-trivial work read `README.md` and relevant docs
  early. Trust current code/scripts/schemas/tests/runtime over stale docs; flag doc drift.
- Use the repo's existing package manager, scripts, test runner, formatter, linter, build, generators.
- When structure is unclear, snapshot it dynamically (`tree -L 2/3`, `rg --files`); don't treat
  `README.md` as a file inventory.
- Don't add new production dependencies without explicit user approval; prefer existing utilities,
  framework APIs, or the standard library.

## Project Context Snapshot

- **What it is:** {{PROJECT_ONE_LINER}} «one or two sentences: what the product is and the stack.»
- **Code layout:** {{CODE_LAYOUT_HINT}} «point to the main module folders; discover detail dynamically.»
- **Persistence / tenancy:** {{PERSISTENCE_AND_TENANCY}} «e.g. "Postgres via X client; all
  tenant-scoped data is filtered by <tenantId> resolved from <source>; never hardcode identity."
  Delete if not applicable.»

## Code Reality vs Target State (optional — delete if not applicable)

«Keep this if your docs describe a target state that the code hasn't fully reached yet.»
- Current code reality always wins over docs that describe intended/target behavior. When a doc and the
  code disagree, trust the code and flag the drift.
- If your product docs tag status (e.g. `Implemented` / `Partial` / `Target-state` / `Blocked`), respect
  those tags: don't treat a target-state description as if it were already built.

## Documentation Base (source of truth for product/ops knowledge)

- Durable product / operations / architecture knowledge lives at: {{DOC_BASE_PATH}}
  «the path to your documentation vault — an Obsidian vault, a `docs/` tree, a wiki export, anywhere.
  This is where governance, PRD/flows, architecture, and the backlog live. The tms-* skills read this
  path from here.»
- The task pipeline folders live at: {{TASK_FOLDER_PATTERN}} «e.g. "docs/<TICKET-ID>/" — one folder per
  task holding the eight stage artifacts.»
- The backlog (single source of truth for tasks) is: {{BACKLOG_LOCATION}}
- The trigger register is: {{TRIGGER_REGISTER_LOCATION}} «a list of findings that matter only when a
  named event happens ("the first bulk import", "a second API instance"); stage 04b adds rows here.
  Can be a section of the backlog.»
- The traceability / requirements map (if any) is: {{TRACEABILITY_LOCATION}} «delete if none.»
- Ticket-ID format: {{TICKET_ID_FORMAT}} «e.g. "PROJ-123". Used everywhere a task is referenced.»

## Pipeline Execution

Eight stages, each run in its own fresh context and each leaving one artifact in the task folder:

| # | Stage | Skill | Artifact | Who stops |
|---|---|---|---|---|
| 00 | Ticket | `tms-00-ticket` | `00_ticket.md` | — |
| 01 | Research | `tms-01-research` | `01_research.md` | — |
| 02 | Design | `tms-02-design` | `02_design.md` | **owner reads and approves** |
| 03 | Plan | `tms-03-plan` | `03_plan.md` | the lead signs, with its date |
| 04 | Implementation | `tms-04-implement` (a screen: `tms-ui-screen`) | `04_implementation.md` | — |
| 04b | Code review | `tms-04b-review` | `04b_review.md` | — |
| 05 | Test report | `tms-05-test` | `05_test_report.md` | — |
| 06 | Gate | `tms-06-gate` | `06_review_gate.md` | **owner decides** |

- `tms-run` carries one task through all eight stages. When the user invokes a single stage, run only
  that stage, write its artifact and stop.
- **Two owner stops: after design (02) and at the gate (06).** Silence is not approval at either stop.
  The plan (03) is read and signed by the lead, not the owner.
- **Product forks go to the owner at design, before the solution is chosen.** A destructive or
  outward-binding decision is never chosen silently either. Internal architecture is the agent's call.
- **File Ownership in the plan is the boundary of implementation.** A file not in that table is not
  written; needing one means stop and ask, not widen.
- An agent does not create a task or a rule by itself: a problem found mid-task goes to the owner with
  its justification.
- Before implementing, confirm the item exists in the backlog and is the exact target; relevant
  product/architecture docs are checked when the task touches lifecycle/routing/permissions/payments/
  analytics/sync; open questions are resolved or flagged.

## Gate: who signs what

- **Only a human writes `go`.** No agent writes it, and silence is never read as consent.
- **The lead may sign `conditional_go`** when the only thing still open is execution — a live check, a
  rollout, a runbook step. The condition is named in one line together with the launch-playbook
  document that closes it.
- **The gate goes to the owner, and not as a formality,** whenever any of these holds: a product fork
  the task had no right to settle; an irreversible or outward-facing action; risk to user data or money;
  `no_go`; or the task asks the owner for work (grant access, create an account, confirm on a device).

## Task Mode

Classify before editing and scale process to the task:
- `Direct`: cosmetic, copy, spacing, styling, comments, or obvious local edits with no runtime-behavior
  change → smallest coherent change, narrow validation when cheap.
- `Investigation`: diagnosis/debugging when root cause is unclear → reproduce/trace the failure path,
  vertical + horizontal research before patching, identify the owning layer.
- `TDD-first`: behavior, logic, contracts, auth, permissions, persistence, validation, query semantics,
  routing, state transitions, concurrency, non-trivial user-facing changes → prefer the highest-value
  failing test the repo supports, keep the loop strict (failing case → minimal implementation → green).

Treat feature work as `TDD-first` by default unless clearly `Direct`.

## Vertical And Horizontal Research

Before fixing non-trivial behavior, inspect both the runtime path and neighboring systems.
- **Vertical** (execution path): UI/caller → route/guard → page/orchestrator → hook/handler/service →
  contract/API → persistence/external. Async: trigger → queue/job → retry/idempotency → side effect →
  status/error visibility.
- **Horizontal** (adjacent surfaces that must stay consistent): sibling routes, similar components,
  shared services, schemas, serializers, tests, docs; loading/empty/error/success/disabled/optimistic/
  retry/stale-cache states; producer and consumer sides of contracts; read and write paths.

Do enough research to find the owning layer; don't turn research into wandering.

## Root Cause Discipline

- Understand the failure path before patching; fix the owner layer, not the nearest visible symptom.
- If a bug surfaces in a leaf, inspect the owning layer before adding local compensation. Reject
  child-side fallbacks, defensive state repair, duplicated decision logic that hides an upstream mistake.
- Don't preserve a broken decision with guards/flags/wrappers. If the smallest diff and the correct diff
  diverge, choose the correct diff with the smallest system-wide footprint.

## Change-Surface Triggers

When touching a boundary, inspect and align directly coupled code:
- Shared contracts/schemas: validate producer and consumer sides.
- Routes/guards/redirects/layouts: inspect protected/public flows, navigation side effects.
- Queries/mutations/fetch contracts: inspect keys, invalidation, and loading/empty/error/success states.
- Schema/persistence: inspect contract shape, serializers, migrations, read and write paths.
- Auth/permission: inspect guards, session shape, backend enforcement, affected user-visible states.
- Async workflows: inspect retries, idempotency, ordering, cancellation, failure visibility.
- User-facing copy with legal/billing/privacy/security meaning: preserve the product contract.

## Minimal Sufficient Change

- Aim for the smallest coherent change that fully solves the real problem at the owning layer — minimal
  surface area, moving parts, and abstraction count, not smallest diff at any cost.
- Prefer flat, simple implementations over extra layers/patterns; local clarity over clever reuse;
  decoupling over DRY (small intentional duplication beats the wrong shared abstraction).
- Don't add abstractions/helpers/wrappers/folders unless they remove real current complexity.

## Acceptance Contract

For non-trivial work, define a short acceptance contract: what "done" means; 3-5 observable pass/fail
criteria; the primary signal (preferably user-visible/runtime behavior); secondary signals (tests,
typecheck, lint, build, logs). No ceremony for simple local tasks.

## Testing And Validation

- Run the smallest meaningful validation covering the changed surface; cheap gates first
  (targeted tests → typecheck → lint → build → focused scripts), wider suites only when needed.
- Project commands: tests = `{{TEST_CMD}}`, typecheck = `{{TYPECHECK_CMD}}`, lint = `{{LINT_CMD}}`,
  build = `{{BUILD_CMD}}`. «fill in your real commands; delete any that don't apply.»
- **Task check:** `{{TASK_CHECK_CMD}}` «one command that builds, type-checks and tests every package a
  task touched, run in the task's working copy. Stages 03, 04, 04b and 05 call it. If you have none yet,
  write the commands it should chain; a single script is strongly recommended.»
- **Known-test-debt register:** {{KNOWN_TEST_DEBT_LOCATION}} «a list of suites that are already red on
  the main branch. Before calling a red test a regression, check it — read it from the main branch, not
  from the task branch. Listed suites are still run; the register excuses the colour, not the run.»
- Green means exit code 0 **and** the expected marker in the output; a wrapper that prints success
  regardless of its exit code is not evidence.
- Validate after implementation and before closing. If contracts change, validate producer + consumer.
- Treat non-zero exits, runtime errors, failed assertions, type/lint/build errors as failed validation.
  Don't declare success on proxy metrics alone — green tests are not enough if the user-visible signal is
  still broken. Never hide validation failures.

## Documentation Discipline

- Code is the primary source of truth for implementation details; the documentation base captures durable
  context (architecture, workflows, operational constraints, runbooks, caveats, non-obvious decisions).
- Don't mirror code structure in docs, hand-maintain file inventories, or churn docs for trivial
  refactors/moves/formatting.
- Update docs when a change materially affects architecture, setup, operations, contracts, user flows, or
  important decisions. After implementation, check whether durable knowledge should be added/aligned, and
  call out any relevant doc drift left out of scope.
- **Keep the documentation base a living source of truth.** It starts as an MVP baseline and grows with
  the product. After a task ships, the vault must reflect what was actually built — fold the delivered
  behavior and decisions back into the owning docs (PRD / flow / architecture / backlog status), so the
  vault state always matches reality, not just the original intent.

## UI And Design

«Delete this section if the project has no UI. Design system / component library location:
{{DESIGN_SYSTEM_HINT}}»
- **Accepted-screen register:** {{ACCEPTED_SCREENS_LOCATION}} «the list of screens the owner has
  accepted, with their baseline frames. Accepted screens are the reference: a change to a screen runs
  through `tms-ui-screen`, starts from the design system and the nearest accepted screens, and an
  accepted screen is not redesigned in passing by another task.»
- Follow the existing design system, component primitives, and styling conventions; preserve the visual
  language unless a redesign is requested.
- Prefer parent padding + container gap for layout rhythm over ad hoc margins; keep spacing on the shared
  scale (one-off values only when visually justified).
- Treat shared visual components as visually closed units (surface, padding, radius, internal spacing,
  typography, control sizing belong to the component). Compose from the outside through wrappers, not
  visual overrides; for different treatment prefer existing semantic props → the smallest reusable
  semantic prop → a local feature-level wrapper. Don't bypass established primitives with ad hoc surfaces.

## Stage 04 and 04b

- **Stage 04 has one executor.** The stage agent writes the whole plan itself, phase by phase,
  TDD-first, proving each phase with the plan's own validation row. There are no per-phase tester,
  reviewer or architect escorts and no risk profiles: a plan is one dependent chain, and a chain split
  across agents loses what lives between its links. A genuinely bulk, independent phase (a mechanical
  rename across many files) may go to one developer subagent, recorded with its reason.
- **One security pass, only on a trigger.** When the change touches any item in *Security Triggers*
  below, stage 04 runs one read-only security review over the assembled diff (at most one re-check of
  what it changed). No trigger — no pass, stated in one line.
- **Stage 04b is independent review.** Up to five passes, each a fresh read-only reviewer that never
  sees the implementer's conversation, plus a stagnation rule: two consecutive passes with no change to
  product files and only repeated, rejected or non-blocking comments end the loop. One pass always walks
  the end-to-end path; a screen change also gets a visual pass.
- **A finding blocks only when** it is reachable on the current code **and** a person using the product
  would observe the consequence. Every other finding gets a route — fixed now, proposed as one backlog
  row at the gate, added to the trigger register, or dropped with a reason. Review holds no score and no
  verdict; the gate decides.
- Stages 00–05 never stage or commit. Stage 06 creates one task-scoped closing commit after `go` or
  `conditional_go`. Never push automatically, never add AI attribution.

## Security Triggers

Stage 04 runs its security pass, and stage 04b uses the strongest judgement model for its reviewer,
when a change touches any of these. Keep the generic list and add your stack's specifics:
{{SECURITY_TRIGGERS}}
«e.g.:
  - authentication, authorization, sessions, token issuance, role/capability logic
  - tenant-scoping predicates, row-level security, identity resolution (<how you resolve user/tenant id>)
  - input validation at a trust boundary (HTTP, webhook, upload, bot/chat payload)
  - secrets, signing keys, webhook signature verification, audit logging
  - money: pricing, payment links/routing, refunds (<your payment integration>)
  - PII handling or cross-tenant data access
  - code under <your auth/identity/tenant-scoping module paths>
»

## Database / Schema Migration Policy

{{MIGRATION_POLICY}}
«Describe how schema changes are made in YOUR project. Generic guidance to keep:
  - Prefer additive, idempotent changes (ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS).
  - Constraints that validate against existing rows: write a pre-flight count check ("expect 0").
  - If a migration must land before/after a specific deploy step, state the ordering in the launch
    playbook entry, not only the migration file.
  - Register every new migration in the launch playbook with verification queries + expected results.
Delete this whole section if your project has no database.»

## Future Work Capture

Never leave future work, postponed scope, or deltas only in chat. **Conversation contract:** when a
stage closes, the final summary MUST name which follow-ups were captured and where (IDs + path).

**Where follow-ups land (by type):**
- **Actionable** → a new one-line row in the backlog ({{BACKLOG_LOCATION}}): fresh ticket ID, area,
  driver/scope, priority, status `Backlog`.
- **Doc drift / spec gap** → update the owning source-of-truth doc AND cross-reference it in the
  originating task's backlog row.
- **Runbook / manual activity** → the launch playbook (see below), not just the implementation report.
- **Late architecture decision** → an ADR/note in your architecture docs, backlinked from the backlog row.

**Bundle, don't shard.** A backlog shattered into many one-line tickets is an anti-pattern (each = its
own pipeline + review + commits). Before writing follow-ups, in order: (1) drop trivia (one-line
cosmetics go in the next commit, not the backlog); (2) fold into an existing open bundle for the same
epic/surface if one fits; (3) else group the new ones into one bundle by shared surface / review domain
/ driver (2-7 sub-items; split if >7); (4) only then create a new bundle. Don't mix priorities or
unrelated epics in one bundle. Backlog row is an index, not storage — long context goes in the ticket
folder, the row ends `See <task-folder>/`.

**Bundle mechanics.** Bundle ID = the lowest absorbed ticket ID; add an `Absorbs: …` column and tag
sub-items `(formerly <TICKET-ID>)`; create the bundle's `00_ticket.md` with a Composition section
(sub-items + file paths + driver refs); migrate real content out of the absorbed task folders, then
delete them.

**Queue placement (if your backlog is an ordered execution queue).** Insert each new ticket at its
logical execution position (a bug fix near the top, a polish item after its parent, a feature after its
dependencies) — not appended at the end or sorted only by priority. A pending ticket left out of the
queue is an incomplete capture.

## Pre-Launch Manual Action Capture

**Hard rule.** Any manual operational action a human must do before/at launch that an automated test
cannot — applying a DB migration, a live/staging smoke, setting an env key, configuring an external
service, a scheduler/cron check, a deploy-ordering constraint, a UAT step, any `conditional_go` gate
condition — MUST be recorded in the launch playbook before the conversation ends. Leaving it only in
chat or a pipeline artifact is treated as lost.

- Launch playbook location: {{LAUNCH_PLAYBOOK_LOCATION}} «where pre-launch manual steps are tracked.»
- Stage → document mapping: {{LAUNCH_STAGE_MAPPING}} «e.g. migrations/env/config → "01 Infrastructure";
  technical proofs → "02 Technical checks"; live smoke → "03 Smoke"; owner acceptance → "04 UAT";
  go decision → "05 Launch". Adapt to your playbook's structure, or use a single launch checklist.»

**Detail requirement.** Write each item so the owner can execute it unaided: the exact step sequence,
the copy-pasteable command, the precise pass criterion ("expect 1 row", "message arrives"), the
precondition (which step first), and where to look if it fails. No vague lines.

**Closing contract.** The stage's final summary names which playbook document received which item. If the
launch playbook can't be written this turn, output the exact proposed lines + their target file so they
can be transferred manually — never leave the action only in chat.

## Safety And Workspace Hygiene

- Never stop or kill processes just to free ports — use isolated ports or test config overrides.
- Don't propose CI/CD, hosted automation, or deployment pipelines unless explicitly asked.
- Don't print secrets, tokens, keys, credentials, or customer data in responses; don't add real secrets
  to fixtures, tests, docs, or committed files.
- Keep ad-hoc investigation artifacts out of the repo root (use `./.scratch/` or a tool-owned dir).
- Don't weaken auth, permissions, validation, encryption, rate limits, or auditability to ease a task.
- Don't manually edit generated files unless the repo requires it — update the source and run the generator.
- Don't stage, commit, amend, rebase, reset, stash, push, or delete files unless stage 06 explicitly
  requires the single task-scoped closing commit, or the user explicitly
  asks. **Never** add `Co-Authored-By:` or any AI/agent attribution to commit messages
  (legal/licensing constraint); create only commits whose file set clearly belongs to the task, and don't
  push automatically.

## Decision Rules

- If the solution is obvious and low-risk, execute it. If material product/architecture tradeoffs exist,
  present up to two viable options and recommend one. If a safe assumption unblocks work, proceed and
  state it in the final report.
- If an action is destructive, irreversible, security-sensitive, privacy-sensitive, or likely to affect
  unrelated users/data, ask first.
- If two attempts don't move the primary signal, stop and reframe — say what's wrong, why, and the best
  next experiment — rather than burning another near-identical attempt.

## Completion Protocol

At the end of every implementation or investigation, report: what changed and why; root cause when
identified; affected layers; validation performed; `Primary signal status` (met / not met / partially
validated); `Secondary signal status` (exact checks run and what they showed); documentation status;
remaining risks or follow-up work; migration/rollout implications; a concise suggested commit message.

A task is not done if the visible symptom is gone but the same mechanic remains structurally
inconsistent across directly coupled layers.
