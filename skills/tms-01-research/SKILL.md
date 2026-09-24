---
name: tms-01-research
description: Narrow the codebase down to the exact facts a task needs, as-is, with no opinions or recommendations. Use after a ticket exists and before design. Traces the vertical from caller to data and external effect, checks horizontal neighbours, and records exact files and line numbers. Produces docs/TASK-ID/01_research.md. Do not use to choose a solution; that is tms-02-design.
---

# TMS 01 — Research

Stage 2 of 8. Produces a narrow, noise-free context for design.

## What this stage is for

A design agent that has to read the whole repository designs badly. This stage
hands it exactly the facts it needs and nothing else.

## The one rule that shapes everything

**Facts as-is. No opinions, no recommendations, no refactor advice.**

The artifact has no section for them. If you catch yourself writing "should be
refactored" or "a better approach would be", you are in the wrong stage. An
opinion planted here becomes noise in design, plan and implementation.

## What a search can and cannot establish

A search proves **presence**. It never proves **absence**: a pattern that did not
match tells you about the pattern, not about the file.

So there are two different statements, and they are not interchangeable:

- **"Absent"** — you opened the place and looked. This is a fact.
- **"Not found by searching for `<pattern>`"** — the pattern missed. This is not
  a fact, and the next stage must not treat it as one.

They live in separate sections of the artifact for exactly this reason. Writing
the second one as the first is how a false absence travels through design and
plan untouched: neither stage re-researches, and the reader cannot see a row that
is not there.

This matters most in a file too large to read whole. There, everything you know
came from a query, and a query only ever answers what it was asked.

## An enumerable subject is enumerated, never sampled

If the subject of research is a countable set — migrations in a range, call
sites, routes, screens, tables — then:

1. **Get the list from the source of truth first**, not from prose. `ls`, `git
   ls-files`, the schema, the directory. The list is a fact; a document's
   description of the list is not.
2. **State the count.** "14 migrations, 223–236", not "migrations 223–236".
3. **Give the artifact one row per item.** Not a summary by theme.

A categorical answer — "here are the kinds of pre-flight checks used" — reads as
complete and is a sample. A table of 14 rows shows its own gap: an empty cell is
visible, a missing theme is not.

This is the whole fix for the class of defect where research answers the question
it was asked instead of the question the next stage will need.

## Steps

1. **Read the ticket.** Nothing else from the previous conversation.
2. **Trace the vertical** for the behaviour in question:
   caller or UI → route and guard → page or container → handler or service →
   contract → persistence → external effect.
   Record exact `file:line` at every hop.
3. **Check horizontal neighbours**: sibling routes, matching contracts, other
   readers and writers of the same data, permissions, loading and error states,
   tests, docs.
4. **Find precedents.** Places where this exact problem was already solved in
   this codebase. A precedent is worth more than any invented approach.
5. **List open questions for design** — factual gaps only, not preferences.

## Fan-out: per item, not per theme

Cheap-tier subagents are worth using here, and the shape matters more than the
count. In Claude Code that is `tms-explorer` (pinned to the cheaper tier), never
the built-in `Explore`, which inherits the top tier from the session.

- **Enumerable subject → one subagent per item**, each answering one narrow
  question against one place. Fourteen migrations means fourteen lookups. This is
  exactly what a cheap model is good at, and it is what makes the gap visible.
- **Non-enumerable subject → per angle** (vertical, neighbours, precedents,
  tests).

Per-angle fan-out over an enumerable set reproduces the sampling problem with
more agents: four categorical answers are still four samples.

**The lead verifies before writing anything down.** The check is mechanical, not
a judgement call:

- is every row of the enumerated set filled;
- does every "absent" name the place that was opened;
- is anything in "not found by search" being used as if it were a fact.

A row that fails any of these goes back for another lookup. That is cheap here
and expensive three stages later.

## Artifact template

Write the artifact in the project's output language (`AGENTS.md` → *Operating
Standard*); translate the headings below if it is not English.

```markdown
# <TASK-ID> — 01 Research

Date: <YYYY-MM-DD>
Base SHA: <sha>

## Goal of this stage

One sentence: which behaviour we trace.

## Vertical

An unbroken chain from the person's action to the database and back. This is
not a list of layers: every row names what exactly it hands to the next one —
a parameter, a field, a flag. An empty or broken "Hands on" cell is a finding,
not an unfinished table: where nobody hands anything on is where the defects
live that no single file shows.

| Layer | File:line | What it does now | Hands on |
|---|---|---|---|

## Neighbours

Sibling routes, contracts, readers and writers of the same data, permissions,
loading and error states, tests.

## Exact places

The full list of files and lines the task may touch. No assessment.

## Precedents in the code

Where this same problem is already solved and how exactly. File:line.

## Data and schema state

Tables, keys, constraints and migrations that matter here.

## Enumerable sets

For every countable subject — the source of the list, the count, and a table
with one row per item. An empty cell is allowed and visible; a missing row is
not.

## Absent — checked

What was opened and really does not contain the thing. With the exact place.

## Not found by search

Which pattern did not match and where it was searched. **This is not a fact of
absence** — the next stage may not build a decision on it.

## Open questions for design

Factual gaps design must close.
```

## Stage boundary

Done when a designer who has never seen this task can start from this file
alone. Next: `tms-02-design` in a fresh context.

No solution, no plan, no code, no opinions.
