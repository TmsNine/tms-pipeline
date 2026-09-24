---
name: tms-06-gate
description: Assemble everything a task produced into one page for the decision, then close the task once it is made. Use after implementation, independent review and the test report. `go` belongs to the owner and no agent writes it; the lead signs `conditional_go` only when execution is all that remains. Produces docs/TASK-ID/06_review_gate.md, the closing commit, follow-up capture and launch-step capture.
---

# TMS 06 — Review gate

Stage 8 of 8. The owner decides. The agent assembles and then closes.

## Who decides

**An agent never writes `go`, and never reads silence as approval.** An agent
that decides whether its own work passes is the loop this pipeline exists to
avoid.

**`conditional_go` is the one exception, and the lead signs it** — when the only
thing still open is execution: a live check, a rollout, a runbook step. State the
condition in one line and name the document that closes it. Nearly every task
ends on a check that cannot be run locally; the owner should not have to write
the same word each time for that.

The gate still goes to the owner, and there it is not a formality, whenever any
of these holds: a product fork the task had no right to settle by itself; an
irreversible or outward-facing action; risk to users' data or money; `no_go`; or
the task is asking the owner to do work (grant access, create an account,
confirm something on a device).

If the project's canon (`AGENTS.md`) records this delegation with its own
wording, that canon wins; this section holds only what the stage does with it.
Do not copy reasoning back and forth, and do not let the two disagree.

Your job before the decision: put everything on one page, honestly, short enough
to read in a few minutes.

## What stops the loop

A review loop ends when reviewers stop finding things. That is a fact about the
reviewers, not about the work, and this gate does not accept it as evidence.

Before assembling anything, name the run that shows the task's own outcome
happening: the command, the click, the log line, and what it returned. If there
is none, name the condition that would produce it — that condition **is** the
`conditional_go`, and it belongs at the top of the artifact, not in a closing
paragraph.

A gate that says "the user now sees it" in one section while the test report
says the main signal was never verified has been written twice by two people who
did not read each other. The reader believes the first one.

## Steps before the decision

1. **Assemble.** Acceptance contract from `02_design.md` row by row: done or
   not, with evidence. Signals from `05_test_report.md`, including what was not
   run.
2. **Report what 04b did, do not re-open it.** Stage 04b already routed every
   finding: fixed, proposed, registered as a trigger row, or dropped with a
   reason. Show that table as it is. Do not re-judge those calls and do not turn
   them back into a list for the owner to triage — technical classification was
   that stage's job, and asking the owner to redo it is how a closed loop
   reopens. The only thing that reaches the owner from 04b is a blocking finding
   04b could not close, with what it would take.
3. **List what is left for a human**: migrations, environment, live smoke, UAT.
4. **Put 04b's backlog proposals in front of the owner** — one line each, yes or
   no. These are findings 04b judged real and likely to get in the way of
   ordinary work, but not blocking this task. The owner is deciding priority,
   not re-doing the technical triage.
   Same for any follow-up you consider separate work: one line, its own
   user-visible outcome, a current reproducible driver. Approved ones go to the
   non-blocking part of the backlog — not to the launch gate.
5. Write the artifact with `Gate decision` empty (or signed `conditional_go` by
   the lead when only execution remains and none of the owner conditions above
   holds). **Stop.**

## After the decision

**Go / conditional_go** — close:

- Move human-only steps into the launch playbook (`AGENTS.md` → *Pre-Launch
  Manual Action Capture*) with prerequisites, exact commands or SQL, expected
  result and failure cue. A `conditional_go` condition always lands there.
- Register approved follow-ups as backlog rows. Only the ones the owner
  approved.
- Update the backlog row into exactly one status bucket.
- Create the closing commit. No AI attribution, no `Co-Authored-By`. Do not
  push.

**Fix first** — the owner names which findings must be fixed. That authorises
one more implementation pass on those findings only, then one more review. It is
the owner's call each time, never automatic.

**Not now** — record the state honestly and stop. A task parked with a truthful
record is a better outcome than a task closed with a rewritten one.

## Artifact template

Write the artifact in the project's output language (`AGENTS.md` → *Operating
Standard*); translate the headings below if it is not English.

```markdown
# <TASK-ID> — 06 Review gate

Date: <YYYY-MM-DD>

## Gate decision

<filled by the owner: go / fix first / not now — or conditional_go signed by the lead, with its one-line condition and the document that closes it>

## Proof that the task works

A reproducible command or run showing the target behaviour, and what it showed.
No such run — name the condition that would produce it; that becomes the
`conditional_go` condition.

This field is filled first and may not be empty. "Reviewers find nothing more"
is not proof.

## Acceptance review

| ID from 02 | Behaviour | Done | Evidence |
|---|---|---|---|

## What 04b did

The route table from `04b_review.md` as it is: fixed now · backlog proposal ·
trigger register · dropped with a reason. Plus, if any, the blocking finding
04b could not close and what it would take.

## Validation summary

Primary signal, secondary signal, what was not run.

## Left for a human

Migrations, environment, live smoke, UAT — and in which launch-playbook document.

## Proposed follow-ups

What we consider separate work and why. The owner decides.
```

## Stage boundary

Done when the decision is made and, on go or conditional_go, the closing commit
exists, launch steps are written down and approved follow-ups are registered.

Nothing here creates a task or a rule on its own.
