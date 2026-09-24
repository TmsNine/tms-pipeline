---
name: tms-04-implement
description: Write the code for an approved plan, phase by phase, TDD-first, with the stage agent itself as the single executor of the whole chain. Use after the lead signed the plan. Honours File Ownership as a hard boundary and stops rather than widening scope. Produces docs/TASK-ID/04_implementation.md. Do not use for independent review; that is tms-04b-review.
---

# TMS 04 — Implementation

Stage 5 of 8. The only stage that writes product code.

## Shape

**The stage agent is the executor.** It reads the plan and writes the code
itself, phase by phase, proving each phase with the plan's own check. Fresh
context; the plan is the input, not the previous conversation.

It does not hand phases to developer subagents. The plan is one dependent chain,
and a chain split across agents loses what lives between its links: a task can
lose its whole outcome between five individually correct phases. Splitting also
costs more than it saves — a lead that only coordinates spends most of its
budget re-reading the plan, the briefs and the reports. (`tms-run`, "The lead
and the workers", has the reasoning.)

One exception: a phase that is genuinely bulk and independent of the rest — a
mechanical rename across dozens of files, a large fixture — may go to one
`tms-developer` with a bounded brief. That is rare, and it is recorded in the
phase section with the reason.

## The boundary

**File Ownership from the plan is the boundary.** A file outside that table is
not written — not "while I'm here", not "it's one line", not "the test needs it".

When implementation discovers it must touch something else, it **stops and
returns to the owner** with: what was found, why the planned list is not enough,
what it costs to proceed without it. The owner extends the plan or does not.
This is a two-minute conversation instead of a review round.

The same holds for means. A tool, generator, harness or script that is not on
the list does not get built.

## UI code has one more precondition

Before the first edit to a screen component, the plan must already carry the
registered baseline entries and the reuse matrix required by the project's
design system (`AGENTS.md` → *UI And Design*). If it does not, stop and return
to the owner exactly as for a missing file. Do not infer the visual language
from the file you are editing — that is how a screen ends up with its own
spacing, type scale and control shapes while every test stays green. (A screen
task normally runs this stage through `tms-ui-screen`.)

## When the plan turns out incomplete

It happens: a normative definition the phase needs is not in the plan. Stop at
that phase and say exactly what is missing.

**This is an append, not a restart.** The missing or contradictory text is
corrected in `03_plan.md` and implementation **resumes at the affected phase**.
Phases that do not depend on the addition keep their state; RED tests already
written stay valid; finished phases are not redone.

This is a recovery path for a missed detail, not a normal design activity in
stage 04. Stage 03 owns prevention; stage 04 only contains the damage if a gap
still survives.

**Who confirms the append depends on what it changes, and most of the time it is
nobody.**

| The append… | Then |
|---|---|
| does not change observable behaviour and does not widen `File Ownership` | **Make it, record it in `04_implementation.md`, continue.** No approval. It is a technical correction, and deciding technical questions is this stage's job |
| changes what a user of the product sees, can do or must recover from | Stop and ask the owner — this is a product decision, same bar as the design interview |
| widens `File Ownership` | Stop and ask the owner — the boundary is theirs |

A plan can also contradict itself. The cold reader and RED-test specification in
stage 03 are responsible for catching that before approval. If one still reaches
implementation, correct only the affected text and phase under the table above;
do not reinterpret the miss as a reason to restart the task.

Never re-run the whole plan because one phase was short of a contract. The
full restart is self-inflicted cost, not a safety measure.

Do not go looking in the design for what the plan lacks. The gap is the fact to
report; filling it silently from another artifact hides the defect and leaves
the next task to hit it again.

## Phases

For each phase, in order:

1. **Write the test first.** The TDD matrix from the design says which one and
   what it proves. Red before green.
2. **Make the smallest change** that turns it green, within the phase's files
   from File Ownership.
3. **Run the phase's check** from the plan's validation strategy.
4. A phase is finished when that check is green. Only then start the next.

## Walk the seams before you finish

You wrote both ends of every seam, so checking them is cheap — do it on purpose.
After the last phase, go down the plan's seam table and, for each hop, quote the
line on the producing side and the line on the consuming side that agree. A hop
you cannot quote both ends of is not finished.

## Prove the whole, once

After the last phase:

- **Run the project's task check** (`AGENTS.md` → *Testing And Validation*) in
  the task's working copy: build and types for every touched package, their
  tests under the right conditions, and whatever else the project bundles into
  it (contract links, migration numbering). Red is fixed here unless it is
  listed in the known-test-debt register — read the register from the main
  branch, not from the task branch.
- **Security, when triggered — one pass over the whole diff.** When the task
  touches any of the project's security triggers (`AGENTS.md` → *Security
  Triggers*; typically authentication, authorization, sessions, roles, row-level
  security or tenant predicates, identity resolution, input validation at a
  trust boundary, secrets, webhook signatures, audit, money, PII, or an external
  command that mutates tenant data), spawn **one** `tms-security` over the
  assembled change. Fix what it finds inside File Ownership. Not triggered — no
  security pass; say so in one line. Never talk yourself out of a trigger.

There is no per-phase tester, reviewer or architect escort. Independent review
of the assembled whole is `tms-04b-review`, in a fresh context that does not
know this conversation — that is where independence comes from.

## Size of the change

The phase deliverable is **the smallest change that turns the plan's validation
command green**, at the layer the plan assigns it. Not the most complete version
of the idea, not a version that anticipates the next phase, not the one a
thorough engineer would write given unlimited time.

**No other skill overrides this.** A skill that enforces exhaustive, unabridged
output governs *finishing what was asked for*, not *how much to build*. Where the
two disagree inside a phase, this stage wins — do not load an output-completeness
skill into a phase.

Oversized phase output is not harmless surplus. It enlarges the review surface,
which lengthens every proving round that follows, which is the loop the next
section exists to stop.

## Convergence — when proving stops

The phase's check from the plan's validation strategy **is** the closing
criterion. There is no second, unwritten one. Do not invent additional closing
conditions mid-stage — not "green is not enough", not "needs a fresh N-role
proof", not "every remediation invalidates all previous proofs".

**The security pass runs at most twice** — the pass, and one re-check of what
it made you change. A re-check that produces no change to product files is the
last one. What a pass finds, it fixes — that is what the pass is for.

**A finding that arrives after the phase is closed does not reopen it.** Write it
as a row into `docs/<TASK-ID>/04b_review.md` and go to the next phase. Do not
weigh it and do not decide whether it is serious enough: this stage holds no bar
for that, on purpose. `tms-04b-review` runs that loop with the bar, the routes, a
pass limit and a stagnation rule, and it runs before anything reaches the owner.
Judging it here does the work twice and closes nothing.

Re-prove only the surface that changed. A remediation does not invalidate proofs
of untouched behaviour.

A change proved more than twice is not safer, it is stalled. The review surface
grows with every remediation, so a fresh exhaustive reviewer will always return a
non-empty list. **A finding count that grows across rounds is the signal to stop,
not to continue.**

If proving cannot proceed for an infrastructure reason — an agent or thread
limit, a missing tool — stop and return to the owner **on the second
occurrence**. Never start another executor on the same work.

**Stage 04 calls no other review roles.** Gap auditors, wave reviewers, risk
reviewers, scoring reviewers and similarly named runtime roles are not part of
the delivery pipeline. High-risk independent review is one reviewer slot in
stage 04b, using its risk-aware prompt and the strongest available judgement
model — never an extra reviewer or pass here.

Brief the security pass once and narrowly: exact paths, what changed, which
trigger fired. It re-reads only what it verifies.

## Artifact template

Write the artifact in the project's output language (`AGENTS.md` → *Operating
Standard*); translate the headings below if it is not English.

```markdown
# <TASK-ID> — 04 Implementation

Date: <YYYY-MM-DD>
Plan: docs/<TASK-ID>/03_plan.md

## Phase N — <name>

Files: <from File Ownership>

**Done:** what changed, in substance.
**Test:** which one was written, what it proves, that it was red before the change.
**Checks:** command → result.
**Deviations:** what did not go to plan and how it was resolved. Empty is an answer too.

## Seams

| Seam from the plan | Producer line | Consumer line | Agree |
|---|---|---|---|

## Whole-task check

<task check command> → result and red lines (known debt — with a link to the register row).
Security: <one pass — what it found and what was fixed> | <not needed — no trigger touched>.

## Stops and returns to the owner

What required going beyond File Ownership and what the owner decided.

## Summary

All phases, their state, the total diff.
```

## Stage boundary

Done when every phase is green and the artifact is written. Next:
`tms-04b-review` in a fresh, independent context.

Do not stage, commit or push here. Do not self-review — that is the next stage
and it must not know this conversation.
