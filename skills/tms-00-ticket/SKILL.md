---
name: tms-00-ticket
description: Turn the owner's own words, or a problem discovered during other work, into a registered task ticket. Use when the owner describes something to build or fix, when a real defect surfaces mid-task and needs its own ticket, or when the owner asks to register a backlog item. Produces docs/TASK-ID/00_ticket.md. Do not use to research or design; that is tms-01-research and tms-02-design.
---

# TMS 00 — Ticket

Stage 1 of 8. Turns intent into a registered task. Nothing else.

## What this stage is for

The owner describes a task in their own words, or a real problem surfaces while
working on something else. This stage turns that into one ticket with a
user-visible problem statement.

## Who may create a ticket

Only the owner decides that a task exists.

- **Owner-initiated** — the owner describes it; you formalise it. Proceed.
- **Discovered during work** — you found a real, reproduced problem. You do not
  register it yourself. Bring it to the owner: what breaks, for whom, what it
  costs to leave, why it does not belong inside the current task. The owner
  decides. Only after an explicit yes do you write the ticket.

A hypothesis with no reproduced failing path is not a ticket. Record it in the
current task's notes and move on.

## Steps

1. **State the problem in one sentence, from the user's side.** If the sentence
   needs another of your task IDs or a gate requirement to make sense, it is not
   a user problem yet — go back to the owner.
2. **Reconcile the ID.** Use the ticket-ID format and check the active backlog,
   the closed archive and `docs/<TASK-ID>/` (`AGENTS.md` → *Documentation
   Base*). Never attach new scope to a task already closed; cite it as evidence
   instead. Extend a still-open owning task when the work fits it.
3. **Write `docs/<TASK-ID>/00_ticket.md`** using the template below.
4. **Add one short row** to the canonical backlog. The row is an index, not
   storage.

## Artifact template

Write the artifact in the project's output language (`AGENTS.md` → *Operating
Standard*); translate the headings below if it is not English.

```markdown
# <TASK-ID> — <short title>

Status: OPEN
Date: <YYYY-MM-DD>
Priority: Must | Should | Could
Source: <the owner's words / where it was found>

## Problem

One sentence from the user's side: what a person cannot do today.

## Who it affects

Which role or kind of user — and in which scenario.

## How it shows up today

What the person sees instead of the right behaviour. If there is a
reproduction — the exact steps.

## What becomes possible

One or two sentences about the outcome the user will see.

## What we do NOT do here

Explicit boundaries: neighbouring surfaces that stay as they are.

## Source

The owner's words, a finding in task <ID>, a backlog row.
```

## Stage boundary

Done when the ticket exists, the backlog row exists, and the problem sentence
stands on its own. Next: `tms-01-research` in a fresh context.

Do not research, design, estimate or touch code in this stage.
