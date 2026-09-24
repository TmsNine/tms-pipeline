---
name: tms-03-plan
description: Break an approved design into small isolated phases with an exact file list before any code is written. Use after the owner approved the design. Produces docs/TASK-ID/03_plan.md with phases, execution order, File Ownership and validation strategy, then stops for the lead to read and sign. Do not use to write code; that is tms-04-implement.
---

# TMS 03 — Plan

Stage 4 of 8. **The last read before code — the lead's, who signs the plan.**
The owner does not review plans; the owner's two stops are the design and the
gate.

## Why this stage exists

This is where the lead sees, in one list, everything that is about to be
written. Not the intent — the actual files and the actual means.

The concrete lesson: a task approved as "name the foreign key explicitly" can
grow a 244-line parser as a regression guard. Nobody chose that. It appears
because there was no list to put it on. On this list the lead reads one line —
"writing a parser for the guard" — and answers "use a regex".

## When the plan is finished

> **Every phase has an exact RED-test specification that can be implemented
> from this plan alone, and its only expected failure is that the product code
> does not exist yet.**

That is the whole criterion. It is not a checklist item on top of the plan — it
is what makes the document a plan rather than prose about one, and stage 04 does
not start until it holds.

Read a failure of it as a diagnosis:

| The test specification… | What the plan is missing |
|---|---|
| cannot be completed at all | a normative definition — schema, SQL, interface, contract |
| cannot be completed without opening `02_design.md` | that definition is cited instead of carried; copy it in verbatim |
| is complete but its assertion cannot be decided | two statements in this plan contradict each other |
| has nothing to assert against | the plan invented a service or layer the design did not ask for |
| would be red for any other reason | the plan describes something untrue of the current code |

Stage 03 writes the complete specification and proof table, not test files.
Actual RED tests are the first code written in stage 04, after the lead signs
the plan. This preserves both checkpoints before code while forcing every
contract, assertion, fixture and command to be decidable now.

## File Ownership is the contract

The file list is not documentation. **It is the boundary of stage 04.**

A file that is not on this list does not get written. If implementation finds it
must touch something else, it stops and comes back here with the owner. That is
cheap; discovering it in review is not.

The same applies to means: a new tool, script, generator or test harness is a
line on this list, or it does not exist.

## One file is read in full before signing

The file that will **consume** what this task produces: the caller, the entry
point, the screen that renders the result. Read it end to end, not by ranges.

Not the files that produce the work — those are covered by their own phase's
tests. This is the single place where a lead's context economy is a false
saving: the consumer is where an assumption lands with nobody checking it, and
it is usually the smallest file in the task. Two minutes of context against a
task whose headline outcome silently does not happen.

## When the plan touches a screen

If any file in File Ownership is a screen component, read the project's design
system and accepted-screen register (`AGENTS.md` → *UI And Design*) before
writing the plan, and carry its pre-implementation gate **inside the artifact**:
the registered baseline entries used as visual reference (the two nearest
accepted screens), and a reuse matrix covering shell/header, typography,
background/texture/glow, card and control geometry, colour, shadow and icon
treatment.

A plan that authorises UI code without them is incomplete, and implementation
must not start from it. The plan is where this gate becomes checkable. Projects
without a UI skip this section.

## Steps

1. Read `02_design.md`. Nothing else from earlier contexts.

   Under `tms-run` the plan is written by the design agent itself, resumed after
   the owner approved the design: then you already hold the design and the code
   you read for it — do not re-explore it, read only what the plan needs beyond
   the design. Step 6 is what keeps the plan honest, and it is never skipped.
2. **Cut into phases.** Each phase is a finished unit: it can be tested,
   committed and left alone. If a phase cannot be proved by a test on its own,
   it is not a phase yet.
3. **Order them.** Data and contracts before their consumers. Migration before
   the code that needs it.
4. **List every file** each phase creates or changes, including tests, fixtures,
   migrations and any tooling.
5. **Name the check for every phase as a runnable row**, not as a sentence
   about checking: the command, the directory it runs from, and the sign that
   shows green. `Validation strategy` is a table stage 05 runs as-is; a row that
   cannot be pasted into a terminal is not a row.
6. **Have a fresh reader check the plan against itself.** One subagent that did
   not write it (`tms-reviewer` in `PLAN` mode), reading the whole document
   cold, with this question and no other. Not the author: the blind spot that
   produced a contradiction survives the author's own re-reading. Not "look
   carefully" — a bounded pass:
   - every normative contract against every other one that touches the same
     field, table, route or state: a constraint and the write that fills it, a
     default and the check that governs it, a state machine and the transition
     that leaves it;
   - every phase against `File Ownership`: no phase needs a file that is not
     listed, no listed file belongs to no phase;
   - the plan against the design: nothing invented that the design did not ask
     for;
   - **every piece of work against the owner the project prescribes for it.**
     Not "is the plan self-consistent" — the three questions above already ask
     that, and a plan can be perfectly consistent with a design that routed the
     work wrong. This one is answered against the rule text, never against the
     author's paraphrase of it. A screen is executed by `tms-ui-screen` inside
     stage 04, and a missing accepted baseline is an instruction to work from
     the accepted neighbour screens and the design system, never a reason to
     move the screen out of the task. Treat any "this part leaves the scope" as
     the thing to check first: it looks like discipline and it shortens the
     author's own work, which is exactly the combination that hides dropped
     scope.

   Do not use this reader to pre-assign roles to phases. Stage 04 has one
   executor, and asking it here wastes the one whole-plan read on the wrong
   question.
7. **Specify every RED test and satisfy the criterion above.** Name the exact
   test location, setup, action, assertion, command and expected RED reason. Fix
   any missing or contradictory plan text before anyone reads the plan. Do not
   create or edit test files in this stage.
8. **Stamp the Base SHA** — the SHA of the main branch at this moment. It is a
   fact to record, not a decision to make.
9. Write the artifact. **Stop. The lead reads it and signs it with its date.**

Steps 6 and 7 catch the same defects by different means, and both stay: the fresh
reader checks the document cold; the exact RED-test specification forces every
relevant contract into one executable assertion without writing code before the
plan is signed.

## Artifact template

Write the artifact in the project's output language (`AGENTS.md` → *Operating
Standard*); translate the headings below if it is not English.

```markdown
# <TASK-ID> — 03 Plan

Date: <YYYY-MM-DD>
Design: docs/<TASK-ID>/02_design.md
Base SHA: <sha of the main branch at approval>
Status: DRAFT | APPROVED
Signed by the lead: <date>

## Plan

| Phase | What we do | How we prove it |
|---|---|---|

## Normative contracts

Verbatim what the implementation must satisfy: schema with columns, types,
nullability and defaults; FKs and delete rules; check/unique/index predicates;
interface signatures and contracts. Not a link to the design — the text itself.

If a phase needs none of this — say so.

## Execution order

The order of phases and why exactly this one. What depends on what.

## File Ownership

The complete list. Anything not in this table is not written in stage 04.

| File | Phase | Create / change | Why |
|---|---|---|---|

## Data flow

How data moves through the changed layers. One diagram or a few lines.

## Seams

Every hop of the "Vertical" in `01_research.md`: do we change it or leave it as
is, and which phase owns it. A hop that belongs to no phase is a defect of the
plan, not an empty cell.

| Hop | What is handed on | Change / unchanged | Owning phase |
|---|---|---|---|

## Risks and mitigations

| Risk | Mitigation | Sign that it happened |
|---|---|---|

## Validation strategy

Every check is a table row, and every row runs as-is. Not "check that the API
builds" but a command you can paste into a terminal. No prose in this section.

| # | Phase | What it proves | Command | Run from directory | Green = |
|---|---|---|---|---|---|

Row rules:

- **The command pastes and works.** No "etc.", no placeholders, no "same for
  the other packages". Each package gets its own row.
- **The directory and environment variables are part of the check, not
  background.** Many suites give a different answer depending on where they
  are started from or which environment they see (a time zone, a workspace
  flag, a working directory). A row without its directory is unfinished.
- **"Green" is exit code 0 plus the named marker in the output.** A wrapper
  that prints "success" regardless of its exit code is not evidence.

Two rows are mandatory; their absence is a defect of the plan:

1. **Build and type-check of every touched package** — one row per package.
   Test runners often transpile without type-checking, so a green live run
   cannot see this class of defect by construction, while the production build
   calls the real compiler and the rollout breaks. If the project has a single
   task-check command (`AGENTS.md` → *Testing And Validation*), this row is
   that command: one command covers every touched package and none can be
   forgotten.
2. **One check that crosses every seam in the table above with no mock between
   them.** If it cannot be built, say why and put another row with a command in
   its place. "Covered by unit tests on both sides of the seam" is not a
   substitute: a suite where each side mocks its neighbour turns green whether
   or not the product works.

### Manual scenario

The steps a person goes through by hand, and what must happen. Separate from
the table: it has no exit code, and it is the only part of the check that
legitimately has none.

## Fresh-reader check

Who read it, what was compared, what was found. "No inconsistencies" is a valid
result.

## Proof of executability

| Phase | File and test | Setup → action → assertion | Command | Why it will be red |
|---|---|---|---|---|

The only allowed expected RED reason is that the product code does not exist
yet. Any other reason means a hole or a contradiction, and it is fixed here. The
test file is created only in stage 04 after the plan is signed.
```

## Lead checkpoint

The artifact ends here. Do not start implementing.

## Stage boundary

Done when the lead signs it, with its date, and `Status: APPROVED` is set. Next:
`tms-04-implement` in a fresh context (or `tms-ui-screen` for a screen).
