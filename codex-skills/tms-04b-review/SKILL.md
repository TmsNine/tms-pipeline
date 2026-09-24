---
name: tms-04b-review
description: Iterative independent code review of a task's active changes using fresh read-only reviewer agents that never inherit the orchestrator's conversation history. Loops review, fix and validation until no blocking finding remains, and gives every remaining finding a route — fixed now, proposed as a backlog row, registered as a trigger, or dropped with a reason — instead of handing the owner a list to triage. Use after implementation. Produces docs/TASK-ID/04b_review.md. Never decides whether the task passes and never returns the task to an earlier stage on its own.
---

# TMS 04b — Code review

Stage 6 of 8. Based on the `loop-code-review` skill by di-sukharev, with the
finding contract below replacing its verdict and its open-ended stop.

## Purpose

Treat review as a **handoff**. The reviewer must reconstruct what the change
does, how its important control and data flow work, which invariants it relies
on, and why non-obvious decisions exist. If a capable reviewer cannot do that
after inspecting reasonable repository context, the exact source of confusion is
itself a finding.

Review comprehensibility and change safety alongside correctness, security,
privacy, data integrity and operational behaviour, combined with focused tests,
static checks and builds for the changed surface.

## What happens to a finding

A reviewer has no cost function: it is rewarded for finding, never for shipping,
so there is always one more edge case. Limiting passes does not fix that.
Defining what a finding *does* fixes it.

**A finding blocks acceptance only when it has both** a path that reaches it **on
the current code** — not "could happen if" — and a consequence **a person using
the product observes**: wrong data, a lost message, a refused action, money or
access going astray.

Everything else does not block and does not evaporate. Every finding takes a
route, chosen **here, by this table**, never offered to the owner as a menu — any
finding put in front of them reads as a defect, and the honest answer will always
be "fix it". Classifying technical findings is this stage's own work.

| Kind | Route |
|---|---|
| **Blocking** — reproducible on current code **and** user-visible | **Fixed in the loop.** No question to the owner. It is a defect |
| Reproducible, fix is small and inside `03_plan.md` File Ownership | Fixed now — cheaper than registering it |
| **Real and will get in the way of ordinary work soon**, but does not block this task | **Proposed at the gate as one backlog row.** The owner answers yes or no — that is a priority call, which is theirs |
| Matters only when a **named event** happens that a person will actually notice | One row in the trigger register (`AGENTS.md` → *Documentation Base*) with that event as its trigger |
| Preference, style, no concrete risk | **Dropped**, reason written in the artifact |

The trigger register fires only when someone spots the trigger, so the bar for it
is high: name an event like "the first bulk import of real volume" or "a second
API instance". If no such event can be named, the finding is a backlog proposal
or it is dropped.

Proposing is not creating: this stage never assigns a ticket ID and never adds a
backlog row itself. Anything that does not block this task does not become a
launch blocker by being written down.

Never lower the bar to close a finding, and never argue a real user-visible
defect down to a note. Nothing is left unrouted — an unrouted finding is a lost
one.

## Where this stage ends

**Acceptance is: green validation and no unresolved blocking finding.** This
stage holds no verdict and never writes one. `Gate decision` is written in
`06_review_gate.md`, by whoever that stage says may sign it, and never here.
Delivery review has no score and no A/B/C/D classes; those belong to the
separate codebase-audit pipeline (`tms-audit-*`).

"Ready for production" is not an outcome this stage can produce. A pass that
finds nothing means that reviewer found nothing, and the loop ends on the pass
limit or the stagnation rule below — never on a reviewer pronouncing the work
finished.

**Default limit: five passes**, plus stagnation — two consecutive passes with no
change to product files and only repeated, rejected or non-blocking comments.

Reaching the limit is **not** a reason to return the task to design or plan.
Sending a whole task backwards because a reviewer is still finding things
replaces an inner loop with a bigger outer one.

The owner is brought in only when a blocking finding cannot be closed here, in
one of two shapes: the fix needs a file outside `03_plan.md` File Ownership — say
which and why; or it needs means the project does not have — name them exactly,
for example a concurrency run against a real database. Present **one named
blocker and what it would take**, never a list to choose from.

## Reviewer independence

The reviewer shares the filesystem and project instructions but must not inherit
the parent thread's conversation history, reasoning, assumptions, tool results or
earlier review discussion.

- Each pass is a fresh agent in an isolated context. Never resume a previous
  reviewer for a new pass.
- Each pass has exactly one reviewer. When the diff touches authentication,
  tenant scope, money, PII, migrations, lifecycle, queues or external effects,
  use the strongest available judgement model for that same slot; do not add a
  risk, wave, gap or scoring reviewer beside it.
- Pass a self-contained prompt: repository path, task-owned scope, validation
  expectations. No parent analysis, no suspected issues, no proposed fixes, no
  previous reviewer output.
- The reviewer inspects `git status`, diffs, files and validation output itself.
- Follow-up clarification from the same reviewer is not a new pass.

**Who does what.** Each pass is one fresh `tms-reviewer` (pinned to the top tier
at high effort; the end-to-end pass and a visual pass use the same agent type).
The stage agent running this loop fixes what the table routes to a fix, itself,
and runs the validation — it is not a reviewer, so fixing does not touch the
reviewer's independence, and it already holds the context a new developer would
have to rebuild. Hand a fix to a `tms-developer` only when it is bulky and
self-contained. The pass limit, the stagnation rule and the routes are
unchanged.

## Review scope

Review only what belongs to this task, even when the worktree holds unrelated
active work.

- Identify task-owned files and, in mixed files, task-owned hunks. Use the task
  history and `03_plan.md` File Ownership, not `git status` alone.
- State the scope and the excluded paths explicitly in the reviewer prompt.
- Genuinely ambiguous ownership goes to the owner, not to a guess.
- Neighbouring code may be read for context, but findings are limited to
  regressions this change introduces.
- If the scoped changes move mid-review, discard that pass and start fresh.

## Review dimensions

Apply where relevant. Base findings on repository evidence; do not impose a new
architecture or request reuse for uniformity.

- **Comprehensibility and change safety.** Reconstruct responsibility, main flow,
  state transitions, invariants and failure behaviour. Raise a finding only when
  the obstacle is specific: name the confusing symbol or flow **and** the future
  modification or diagnosis it endangers. Unfamiliar domain logic is not poor
  maintainability.
- **Correctness and operational risk.** Behavioural regressions, invalid
  assumptions, security or privacy exposure, data-integrity problems, poor
  failure handling.
- **Where codebases break silently.** Swallowed errors, tenant scope, money
  semantics, PII, lifecycle, queues and outbox, external effects, producer and
  consumer of a shared contract.
- **Test evidence, judged separately.** The owner may not be a programmer; tests
  are the only witness for what they cannot see, and a green suite that would not
  fail for a real regression is the appearance of a check rather than one. For
  each added or changed test: does it exercise the changed behaviour, **would it
  fail for a plausible regression**, does it assert an observable contract, does
  it mock only at real boundaries and never the result under test. If testable
  behaviour changed without tests, say whether that is justified. Weak coverage
  blocks only when it hides a user-visible defect; otherwise it takes a route
  from the table.
- **Reuse and local fit.** Only when a specific existing candidate is a better
  fit — name it and say why.
- **Architecture and conventions.** Only when the deviation conflicts with an
  identifiable project rule or precedent.

- **The end-to-end path, always.** Code review does not see this either, and for
  the same reason: the defect is not in a file. One pass walks the vertical from
  `01_research.md` — the human action to the database and back — and quotes the
  line that supplies each argument at each hop. This pass is briefed to **prove
  the path works**, not to hunt for problems, and therefore cannot pass by
  finding nothing: it either produces the whole chain or names the hop where it
  breaks. Run it on the assembled whole, with the strongest judgement model
  available. A break blocks — it means the task's own outcome never reaches the
  person it was built for, while every test stays green.

- **Visual conformance, whenever the diff touches a screen.** Code review cannot
  see this: one pass must look at the rendered frames beside the registered
  baselines and the design system (`AGENTS.md` → *UI And Design*), and judge
  type scale, control geometry, spacing rhythm, card shape, icon treatment and
  header pattern. Ask what the card says to a person, not what it contains: a
  card rendering free time must not look like a card rendering a booked slot. A
  finding here blocks when a user would misread the screen.

## Workflow

1. **Inspect before spawning.** `git status --short`, `git diff`,
   `git diff --cached`. Include task-owned untracked files, separate this task's
   changes from unrelated active work, record the exact paths. Do not stage,
   commit, reset, stash or push.
2. **Validate first.** Smallest meaningful tests, typecheck, lint and build for
   the touched surface — the project's task check (`AGENTS.md` → *Testing And
   Validation*). Fix red validation before asking for a pass. Record commands
   and results.
3. **Check the brief, then run one fresh reviewer** with the prompt below. Before
   sending, confirm the four required lines are filled: `Mode: INDEPENDENT_04B`
   (every 04b pass, the end-to-end and visual passes included — `tms-reviewer`
   refuses a brief without it), `Pass:` with its focus line, `Scope:` with real
   paths and no `<placeholder>` left, and the `Result`/`Stop` lines. A brief
   missing any of them is not sent — fix it first. A pass the reviewer returned
   for a malformed brief does not count and is wasted work, not a review.
4. **Route every finding** by the table above. Fix what blocks. Reject a wrong or
   stale finding **with evidence written down**. Rows stage 04 already left in
   `04b_review.md` are unjudged findings, not decided ones — they go through the
   same table as the reviewer's own.
5. **Validate after each meaningful fix.** Red validation is never accepted, no
   matter what the review said.
6. **Repeat with a fresh reviewer** after meaningful fixes, a rejected finding or
   a malformed pass — within the limit above.

## Artifact template

Write the artifact in the project's output language (`AGENTS.md` → *Operating
Standard*); translate the headings below if it is not English.

```markdown
# <TASK-ID> — 04b Code review

Date: <YYYY-MM-DD>
Reviewed diff: <command and base SHA>
Passes: <N of 5> · Outcome: <no blocking | a blocking finding remains | stagnation>

## Blocking findings

Sorted by severity of consequence, heaviest first.

| # | File:line | Reproduction on current code | What the user sees | Fix | Status |
|---|---|---|---|---|---|

Empty is a valid and frequent result.

## Where the other findings went

| # | File:line | What | Route | Details |
|---|---|---|---|---|

Route is one of four: `fixed now` (what was fixed) · `backlog proposal` (one
line for the gate: what the work is and how it will get in the way of ordinary
work) · `trigger register` (which event was recorded and why a person will
notice it) · `dropped` (why). No row may be left without a route.

## Trust in the tests

For each added or changed test: would it fail for a plausible regression? does
it assert an observable contract? does it avoid mocking its own result? If
behaviour changed without tests — is that justified.

## Understanding of the change

What the change is responsible for, how the main flow goes, which invariants it
holds. If the reviewer could not reconstruct it — what stayed unclear and which
future change that makes risky.

## Rejected findings

What was rejected and on what evidence.

## Validation

Commands and results per pass.
```

## Reviewer prompt

```text
Mode: INDEPENDENT_04B
Pass: <code | end-to-end | visual> — <focus line for this pass type, below>
Result: return your report as your final message; the stage agent writes it
into docs/<TASK-ID>/04b_review.md. You write no files.
Stop: after one report. Do not fix, re-run after fixes or start a second pass.

Review only the task-scoped active changes in this workspace independently. The
worktree may contain unrelated changes from other tasks; ignore them unless the
scoped changes make them worse.

You have no parent conversation history. Derive every conclusion from repository
state and command output you inspect yourself. Stay read-only: do not edit,
stage, commit, reset, stash or push.

Scope:
- Files and hunks owned by this task: <paths>
- Excluded unrelated work: <paths>
- Task contract: docs/<TASK-ID>/02_design.md and 03_plan.md

Treat this as a handoff to a future maintainer. First reconstruct what the change
does, its important control and data flow, its invariants and failure behaviour.
If you cannot explain a part after reasonable inspection, name the exact symbol
or flow and the concrete future change this ambiguity makes risky.

Separate your findings into two groups, and order each by severity:

1. BLOCKING — the finding has BOTH a path that reaches it on the current code AND
   a consequence a person using the product observes. Give file:line, the exact
   reproduction, what the user sees, and the smallest fix you can name.
2. NON-BLOCKING — everything else: maintainability, reuse, convention,
   unreproduced hypotheses, preferences. Same evidence, plus — for anything you
   consider real — the concrete technical or product event that would make it
   matter. That event becomes its trigger.

If a reproduction cannot be written against the current code, it is
NON-BLOCKING. Say plainly when there are no blocking findings.

Pay attention to where codebases break silently: swallowed errors, tenant scope,
money semantics, PII, lifecycle, queues and outbox, external effects, and both
sides of a shared contract.

If tests were added or changed, judge each one separately: would it fail for a
plausible regression, does it assert an observable contract, does it mock only at
real boundaries without mocking the result under test. If testable behaviour
changed without tests, say whether that is justified.

Do not request speculative refactors, optional hardening, a different
architecture, task splitting or new tickets. End with a short understanding
summary of the changed responsibility and main flow.
```

Focus line for `Pass:`, one of:

- `code` — the whole task-scoped diff and its tests, by the prompt above.
- `end-to-end` — prove the vertical from docs/<TASK-ID>/01_research.md works:
  quote the line that supplies each argument at each hop, or name the hop where
  it breaks. A break is BLOCKING.
- `visual` — the rendered frames in docs/<TASK-ID>/frames/ beside the registered
  baselines and the design system; BLOCKING when a user would misread the
  screen.

## Stage boundary

Done when the artifact is written. Next: `tms-05-test`, then `tms-06-gate`, where
the owner reads this and decides.
