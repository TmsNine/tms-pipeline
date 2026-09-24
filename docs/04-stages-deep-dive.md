# Under the hood: a walkthrough of every stage

> tms-pipeline is a discipline for AI agents: it takes one already-defined task from a ticket to
> reviewed code, keeping the agent's context clean at every step. A task moves through eight stages,
> 00 → 06 with 04b between implementation and the test report. Only one stage writes product code (04,
> implementation); the others each produce a text document (`.md`). Most of the pipeline is thinking on
> paper, not generating code.
>
> This page shows what actually happens at each stage: what goes in, what comes out, who stops the
> pipeline, and which common failure the stage exists to prevent. If the
> [methodology overview](00-methodology.md) answers "why", this page answers "how it actually works".
>
> **First time here?** Read the [README](../README.md) and the [methodology overview](00-methodology.md)
> first. Russian version — [04-stages-deep-dive.ru.md](04-stages-deep-dive.ru.md).

## Where all of this runs

You work with an agent in an ordinary chat inside your AI tool — either **Claude Code** or **Codex**
(you need only one of the two). You type commands like `/tms-run ACME-101` or `/tms-01-research` straight
into that chat. A command like this is a **skill**. The documents each stage produces (`00_ticket.md`,
`01_research.md`, and so on) land in the task folder inside your repository (`docs/<TASK-ID>/` by
default), next to your code. You can read and edit them as ordinary files.

The skills read your project's rules from `AGENTS.md` — test commands, where the backlog lives, which
changes count as security triggers, where launch steps go. A starter is in
[templates/AGENTS.template.md](../templates/AGENTS.template.md); the sections are explained in
[02-configuration.md](02-configuration.md).

## How to read this page

- **The context window is the agent's working memory.** It is limited, and the more clutter it holds,
  the worse the agent reasons. Every stage therefore starts in a **fresh context** from its input
  documents and the ticket — never from the previous conversation.
- **The orchestrator (`tms-run`) and the lead.** `/tms-run <TASK-ID>` is the chat that carries the task:
  it dispatches each stage as its own subagent, collects the document, checks that its required sections
  are filled, and stops at the checkpoints. It never writes code or design and never approves anything
  for you. Its briefs carry addresses (task ID, working copy, skill, input paths), not opinions.
- **Stage agents and role agents.** In Claude Code each stage runs as a pinned agent — `tms-stage` (top
  tier, medium effort), `tms-stage-deep` (top tier, high) or `tms-stage-light` (cheaper tier, medium).
  Inside a stage it may call role agents: `tms-explorer`, `tms-reviewer`, `tms-security`,
  `tms-developer`, `tms-tester`. Codex has no stage agents; there a stage runs on the session default,
  and role agents pin their own model. Details in [06-model-routing.md](06-model-routing.md).
- **Who stops.** You stop the pipeline twice: after design (02) and at the gate (06). The lead signs the
  plan (03). Everything else runs without asking you.

Each stage section below has the same four parts: **In**, **Out**, **Who stops**, **Failure it
prevents**.

## Stage 00 — Ticket (`/tms-00-ticket`)

Runs in the orchestrator's own chat — the one stage without a subagent, because it needs your exact
words.

- **In:** your own words, or a real, reproduced problem found during other work.
- **Out:** `00_ticket.md` — one-sentence problem from the user's side, who it affects, how it shows up
  today, what becomes possible, what the task does *not* do — plus one short row in the backlog.
- **Who stops:** only you decide that a task exists. A problem an agent discovers goes to you as a
  proposal first; a hypothesis without a reproduced failing path is not a ticket.
- **Failure it prevents:** tasks that exist only because an agent thought they should, and new scope
  glued onto an already-closed task.

## Stage 01 — Research (`/tms-01-research`)

Runs as `tms-stage`; bulk lookups fan out to `tms-explorer` agents on the cheaper tier.

- **In:** the ticket, and nothing from earlier conversations.
- **Out:** `01_research.md` — facts as they are, with exact `file:line`: the **vertical** from the
  person's action to the data and back (each row says what it hands to the next), neighbours, precedents
  in the code, data and schema state, open factual questions for design. No opinions, no recommendations.
- **Who stops:** nobody. The lead checks mechanically that every enumerated row is filled before writing.
- **Failure it prevents:** a sample passed off as the whole. A countable subject (migrations, call sites,
  routes, screens) is listed from the source of truth, counted and given one row per item. And
  "**absent** — I opened it and looked" is kept apart from "**not found by searching for** `<pattern>`",
  so a missed search never travels downstream as a fact.

## Stage 02 — Design (`/tms-02-design`)

Runs as `tms-stage-deep` (top tier, high effort). Mandatory for every task, even a one-line fix.

- **In:** the ticket and `01_research.md`.
- **Out:** `02_design.md` — the owning layer (where the behaviour really belongs), the acceptance
  contract as before → after rows in the user's words, design by layer (only touched layers; "unchanged"
  is a full answer), the TDD matrix (every behaviour and the test that proves it), rollout and rollback,
  and an answer to every open question from research.
- **Who stops:** **you — owner stop 1.** You read the design and approve it. If two defensible choices
  change what a person using the product sees, can do or must recover from, the stage asks you one
  question at a time, with a scenario, plain options and a recommendation, *before* choosing a solution.
  Internal architecture is never your question.
- **Failure it prevents:** a fix in the wrong layer, an unplanned tool, or a product decision guessed by
  an agent. Design may also send research back once for a targeted top-up of named rows — the only
  backward move in the pipeline.

## Stage 03 — Plan (`/tms-03-plan`)

Runs as the same `tms-stage-deep` agent, resumed after your approval — it already holds the code it read
for the design. If it cannot be resumed, a fresh one is dispatched.

- **In:** the approved `02_design.md`.
- **Out:** `03_plan.md` — phases that can each be tested on their own; the normative contracts copied in
  verbatim (schema, signatures), not linked; **File Ownership**, the complete list of files stage 04 may
  touch; the **seam table**, every hop of the research vertical with the phase that owns it; a validation
  table where each row is a command, the directory it runs from and what "green" looks like; an exact
  **RED-test specification** per phase; and the Base SHA.
- **Who stops:** **the lead signs the plan**, with its date. Before signing, a fresh reader
  (`tms-reviewer` in plan mode) checks the plan against itself and the design, and the lead reads the one
  file that *consumes* the task's result end to end.
- **Failure it prevents:** scope that nobody chose (a parser written "as a regression guard" because there
  was no list to put it on), a hop between phases that belongs to nobody, and a check written as prose
  that nobody can run. The finish line is concrete: each phase's first test can be written from the plan
  alone, and its only reason to fail is that the product code does not exist yet.

## Stage 04 — Implementation (`/tms-04-implement`)

Runs as `tms-stage`. **One executor for the whole plan** — the stage agent writes the code itself.

- **In:** the signed `03_plan.md`.
- **Out:** the code change and `04_implementation.md` — per phase: files, what changed, the test written
  first and shown red, the checks and their results, deviations; then the seam walk (for each seam, the
  producer line and the consumer line that agree), the project's task check, and the security note.
- **Who stops:** nobody, unless the plan's boundary is hit. A file or tool outside File Ownership, or a
  change to what users see, stops the stage and goes to you. A purely technical correction to the plan
  is appended, recorded and implementation resumes at the affected phase — no restart.
- **Security:** when the diff touches a security trigger (`AGENTS.md` → *Security Triggers*), **one**
  `tms-security` pass over the assembled change, plus at most one re-check of what it changed. No
  trigger — one line saying so.
- **Failure it prevents:** scope creep ("while I'm here"), and defects that live between phases split
  across agents. There are no per-phase reviewers or escorts; a finding that arrives after a phase closed
  is written down for 04b, not argued here.

## Stage 04b — Code review (`/tms-04b-review`)

Runs as `tms-stage`; each pass is a fresh read-only `tms-reviewer` (top tier, high effort). Based on the
`loop-code-review` skill by di-sukharev.

- **In:** the task's diff, `02_design.md`, `03_plan.md`, the research vertical, and any finding rows 04
  left behind.
- **Out:** `04b_review.md` — blocking findings and their fixes, the route of every other finding, trust
  in the tests, an understanding of the change, rejected findings with evidence, validation per pass.
- **How it runs:** up to **five** fresh, independent reviewer passes, each without the parent
  conversation. It stops earlier on **stagnation**: two consecutive passes with no change to product
  files and only repeated, rejected or non-blocking comments. One pass is always **end to end** — briefed
  to prove the path works, quoting the line that supplies each value at each hop or naming the hop where
  it breaks. A screen also gets a **visual** pass beside the accepted baselines.
- **Blocking** means reachable on the current code **and** visible to a person using the product.
  Blocking findings are fixed in the loop. Everything else is routed by the stage itself: fixed now,
  backlog proposal for the gate, a row in the trigger register, or dropped with a reason.
- **Who stops:** nobody. There is no numeric grade and no verdict. You are brought in only when a
  blocking finding cannot be closed here — it needs a file outside File Ownership, or means the project
  does not have — as one named blocker with what it would take.
- **Failure it prevents:** an endless review loop that always finds "one more thing", and the opposite —
  a green suite over a path that never reaches the person it was built for.

## Stage 05 — Test report (`/tms-05-test`)

Runs as `tms-stage-light` (cheaper tier).

- **In:** the validation table from `03_plan.md` and the working copy.
- **Out:** `05_test_report.md` — the **primary signal** (the user-visible scenario, run for real, with
  evidence), every plan row with its exit code and whether the expected marker appeared, the project's
  task check, the **secondary signal** (tests, types, lint, build), known caveats, and what was not run
  and why.
- **Who stops:** nobody. Red is a fact for the gate, not something to fix here. Before calling a red test
  a regression, the stage checks the known-test-debt register (`AGENTS.md` → *Testing And Validation*),
  read from the main branch, not the task branch.
- **Failure it prevents:** a check silently skipped. The report has as many rows as the plan, counted,
  not estimated; a row without an exit code is allowed only for a missing live environment or a manual
  scenario.

## Stage 06 — Gate (`/tms-06-gate`)

Runs as `tms-stage-light`.

- **In:** every artifact of the task.
- **Out:** `06_review_gate.md` — first, the **proof that the task works** (the run that shows its own
  outcome, or the condition that would produce it); the acceptance contract row by row with evidence;
  04b's route table as it is; the validation summary; what is left for a human; proposed follow-ups.
- **Who stops:** **you — owner stop 2.** You decide `go`, "fix first" or "not now". The lead may sign
  `conditional_go` when only execution is left (a live check, a rollout, a runbook step), naming the
  launch-playbook document that closes it — unless there is a product fork, an irreversible or
  outward-facing action, a risk to users' data or money, a `no_go`, or the task asks you for work. Only
  a human writes `go`; silence is not approval.
- **After the decision:** human-only steps go to the launch playbook (`AGENTS.md` → *Pre-Launch Manual
  Action Capture*), approved follow-ups to the backlog, one closing commit with no AI attribution. It
  never pushes.
- **Failure it prevents:** closing a task because reviewers ran out of things to say, and a gate page
  that claims "the user now sees it" while the test report says it was never checked.

## Screens: `tms-ui-screen`

When the task changes a **screen** — anything your accepted-screen register lists (`AGENTS.md` → *UI And
Design*) — stage 04 is `/tms-ui-screen` instead of `/tms-04-implement`. The eight code stages never open
the design system, and no code reviewer can see a pixel; this skill does both. It works from the two
nearest accepted screens and the design system, runs its own steps (scope, product and backend map,
screen contract, first interactive slice, self-QA, independent review) and ends with your visual
acceptance. Before dispatching it, the orchestrator checks that `03_plan.md` carries the baseline entries
and a reuse matrix; missing them, the plan goes back, not the code. Accepted screens are the reference
and are not redesigned in passing. Projects without a UI skip this.

## The audit pipeline: `tms-audit-*`

A separate pipeline for auditing a **whole codebase**, not for delivering a task:

1. **`/tms-audit-scope`** — freezes a snapshot (full or delta), inventories the code and cuts it into
   context-sized zones along owners and seams.
2. **`/tms-audit-sweep`** — one zone per run, each in a fresh context: a finder proposes defects and
   debt, a skeptic tries to refute them, and only findings that survive are recorded.
3. **`/tms-audit-triage`** — consolidates across zones, removes duplicates by root cause, classifies on
   the audit's own A/B/C/D rubric and proposes bundles of work. **Stops for you.**
4. **`/tms-audit-backlog`** — re-checks the approved triage against the current code and maps each
   approved finding exactly once into the backlog, a bundle, an accepted disposition or the launch
   playbook.

In Codex these are numbered `tms-90-audit-scope` … `tms-93-audit-backlog`. The A/B/C/D classes belong to
the audit only; delivery review (04b) does not use them.

## Refactoring skills

Two skills outside the delivery chain, for when you want the code easier to work with rather than a new
behaviour:

- **`/tms-care-refactoring`** — a pragmatic maintenance refactor that keeps behaviour, contracts and
  permissions as they are. It picks one small, high-value change, puts it through a challenge checkpoint,
  locks behaviour with characterization tests first, and treats "no changes needed" as a valid result.
- **`/tms-ui-refactoring`** — moves visual styling into reusable components so that pages and screens
  control only layout.

In Codex: `tms-95-care-refactoring` and `tms-96-ui-refactoring`.

## In short: where the agents work and where you work

| Stage | Runs as (Claude Code) | You |
|---|---|---|
| 00 Ticket | the orchestrator's chat | describe the task; only you decide it exists |
| 01 Research | `tms-stage` + `tms-explorer` fan-out | — |
| 02 Design | `tms-stage-deep` | answer product forks; **approve the design** |
| 03 Plan | `tms-stage-deep` (resumed) + a fresh reader | — (the lead signs) |
| 04 Implementation | `tms-stage` (screen: `tms-ui-screen`) + one `tms-security` on triggers | only if File Ownership must grow |
| 04b Code review | `tms-stage` + fresh `tms-reviewer` passes | only for a blocker that cannot close here |
| 05 Test report | `tms-stage-light` | — |
| 06 Gate | `tms-stage-light` | **decide**: go / fix first / not now; yes/no on follow-ups |
