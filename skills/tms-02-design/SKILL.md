---
name: tms-02-design
description: Design the solution and prove it on paper before the first line of code, for every task regardless of size. Use after research is complete. Fixes the owning layer, observable behaviour, contracts, layer-by-layer design, TDD matrix and rollback. Produces docs/TASK-ID/02_design.md and stops for the owner to read. Do not use to break work into phases; that is tms-03-plan.
---

# TMS 02 — Design

Stage 3 of 8. **The first place the owner looks.** Mandatory for every task,
including one-line fixes.

## Why this stage is never skipped

Fixing a paragraph costs a sentence. Fixing shipped code costs a rewrite. A task
that looks trivial is exactly where an unplanned tool, an extra layer or a wrong
owning layer sneaks in.

## Size is in the length, not in the sections

**Sections are fixed. Length is free.** A task that renames a foreign key in 34
places fills every section — some of them in one line. "Contract: unchanged" is
a complete and correct answer.

There are no routes, profiles or size gates. Do not invent one.

## Owner interview

Interview only when two or more defensible choices change what a user of the
product sees, can do, or must recover from. Internal architecture choices are
the agent's own responsibility — do not hand them to the owner.

Place it after the traced current path and **before selecting the solution**:

`ticket → current path → owner question if needed → decision → behaviour`

Ask exactly one decision question at a time, and give:

- a concrete everyday scenario from the product's use;
- what each option means in plain language, day to day;
- 2–3 mutually exclusive choices;
- a clear recommendation and an easy way to answer.

Under `tms-run`, send the question to the orchestrator; it asks the owner and
returns the exact answer. On a standalone invocation, ask the owner directly.

While waiting, set `Status: NEEDS_OWNER_DECISION`. Never write an unanswered
question into the decision, and never resolve one by guessing. Record each answer
in the artifact as `question → owner's answer → consequence`.

If no product branch remains, skip the interview. It is not a ritual.

## Steps

1. Read the ticket and `01_research.md`. Nothing else from earlier contexts.
2. **Check the research for the two gaps that read as complete**, before deciding
   anything:
   - an **enumerable** subject answered by theme instead of one row per item;
   - a claim of absence sitting in "Not found by search" being used as a fact.

   Either one goes back to `tms-01-research` for a targeted top-up — once, named
   precisely, before any decision rests on it. This is the only backward move in
   the pipeline, and it is allowed here because it costs one lookup now and a
   rewritten plan three stages later. It is not a licence to re-research
   generally: name the exact rows you need and nothing else.
3. **Interview the owner** if the section above applies. Before the decision, not
   after it.
4. **Find the owning layer.** Where does this behaviour actually belong? Fix
   there. A local fallback, a duplicated rule or a new abstraction that hides an
   upstream fault is a wrong design, not a small one.
5. **Write observable behaviour as before → after**, in the user's words.
6. **Design layer by layer** — only the layers this task touches.
7. **Write the TDD matrix**: every behaviour row gets the test that proves it.
   Tests are designed here, not after the code.
8. **Name the rollback.**
9. **Answer every open question from research.** An unanswered question may not
   go into the plan.
10. Write the artifact. **Stop. The owner reads it.**

## Artifact template

Write the artifact in the project's output language (`AGENTS.md` → *Operating
Standard*); translate the headings below if it is not English.

```markdown
# <TASK-ID> — 02 Design

Date: <YYYY-MM-DD>
Base SHA: <sha>
Status: DRAFT | NEEDS_OWNER_DECISION | APPROVED

## Inputs

The ticket, the research, the exact documents and precedents the decision
stands on.

## Owning sources and boundaries

Owning layer: where we fix and why exactly there.
Boundaries: what the task does not touch, even if it is next door.

## Owner's decision

Each interview question as a line: `question → owner's answer → consequence`.
No interview was needed — say so.

## Solution

What we do, in substance. If options were considered — which one was chosen and
why the others were rejected. One paragraph is enough when the answer is obvious.

## Acceptance contract

Observable behaviour as rows. Format: before → after, as the user sees it.

| ID | Who | Before | After |
|---|---|---|---|

## Design by layer

Only the touched layers. "Unchanged" is a complete answer.

### API contract
### Route and permissions
### Service
### Persistence and migrations
### External effects (messaging, payments, queues)
### UI

## TDD matrix

| Behaviour | Test | Level | What it proves |
|---|---|---|---|

## Rollout and rollback

Rollout order, migration number, how we roll back, the sign of failure.

## Resolved questions

Every open question from research — with its answer. None left open.
```

## Owner checkpoint

The artifact ends here and the owner reads it. Do not start planning, do not
touch code, do not "prepare a bit" while waiting.

If the owner changes the decision, the change lands in this file and the design
is re-read. It does not leak into the plan silently.

## Stage boundary

Done when the owner writes an explicit approval and `Status: APPROVED` is set.
Next: `tms-03-plan` in a fresh context (or, under `tms-run`, the same design
agent resumed).
