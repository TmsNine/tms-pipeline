---
name: tms-run
description: Orchestrate one task through the eight-stage TMS pipeline, keeping each stage in its own fresh context and stopping at the owner's two checkpoints (after design, at the gate) and the lead's plan signature. Use when the owner wants a task carried from ticket to closure without moving prompts and artifacts by hand. Does not write code, design or decide the gate itself.
---

# TMS Run — orchestrator

Carries one task through the eight stages. Holds no opinions about the work; it
holds the order, the contexts and the stops.

## The eight stages

| # | Stage | Skill | Artifact | Owner | Runs as (Claude Code) |
|---|---|---|---|---|---|
| 00 | Ticket | `tms-00-ticket` | `00_ticket.md` | formulates | the orchestrator itself |
| 01 | Research | `tms-01-research` | `01_research.md` | — | `tms-stage` |
| 02 | Design | `tms-02-design` | `02_design.md` | **reads** | `tms-stage-deep` |
| 03 | Plan | `tms-03-plan` | `03_plan.md` | — (the lead signs) | the same `tms-stage-deep` agent, resumed |
| 04 | Implementation | `tms-04-implement` | `04_implementation.md` | — | `tms-stage` |
| 04b | Code review | `tms-04b-review` | `04b_review.md` | — | `tms-stage` |
| 05 | Test report | `tms-05-test` | `05_test_report.md` | — | `tms-stage-light` |
| 06 | Gate | `tms-06-gate` | `06_review_gate.md` | **decides** | `tms-stage-light` |

All artifacts live in the task folder (`AGENTS.md` → *Documentation Base*,
`docs/<TASK-ID>/` by default).

## Model and effort belong to the role, not to the owner

The owner starts one chat and never switches model or effort by hand. Every
stage agent above has its model and effort pinned in its definition
(`~/.claude/agents/`): `tms-stage` — top tier at medium, `tms-stage-deep` — top
tier at high, `tms-stage-light` — cheaper tier at medium. The roles a stage
spawns are pinned the same way: reviewer and security at top tier high,
developer at top tier medium, explorer and tester on the cheaper tier.

Always dispatch with the named `subagent_type`. A `general-purpose` stage
inherits whatever the chat happens to run on, so most of the work silently runs
on whatever model the chat was started with. Pin by full model id, never by a
short alias: an alias can resolve to different models over time, even within
the same week.

Codex has no such agent files for stages; there the stage runs on the session
default and the same table says which stages deserve the deeper setting.

**00 is the one stage without a subagent.** The ticket is the owner's words
written down; it costs little and needs the owner's exact sentence, which lives
in this chat.

**03 resumes the design agent** instead of starting a fresh one: after the owner
approves the design, send the approval to the same `tms-stage-deep` agent and
tell it to run `tms-03-plan`. It already holds the code it read for the design
and does not pay to rediscover it. The plan's cold reader stays — that is where
the independence of the plan comes from, not from a fresh author. If the agent
cannot be resumed (the session was restarted), dispatch a fresh
`tms-stage-deep` for 03.

## Two rules that make it work

**One fresh context per stage.** Each stage receives its input artifact and the
ticket, never the previous conversation. A stage that inherits the reasoning of
the one before it inherits its blind spots. This is the whole reason the
pipeline produces good output — protect it.

The single deliberate exception is 03: the plan is written by the design agent
it elaborates, and its independence comes from the cold reader `tms-03-plan`
requires. No other stage continues another's context — above all, never the
review in 04b.

**Two owner stops and the lead's plan stop.** After 02 and at 06 the pipeline
waits for the owner. Not "waits unless it seems obvious". Waits. After 03 the
lead reads the plan and signs it, with its date, in the artifact before 04
starts — the owner does not review plans.

You may not approve on the owner's behalf, infer approval from silence, or run
the next stage "to save time" while waiting.

A further stop can appear inside stage 02: when two defensible choices change
what a user of the product sees, design sets `NEEDS_OWNER_DECISION` and raises
one question. Relay it to the owner and return their exact answer — do not
answer it yourself, and do not let the stage pick a branch to keep moving.

## The lead and the workers

The orchestrator dispatches; stage agents do the work. Inside a stage the rule
is: **one dependent chain, one executor.**

Coordinators cost more than the workers they coordinate. A lead that "does not
write code" re-reads the plan, the briefs and every report on every step, and
re-reading context is where most of the spend goes. When the work is one
dependent chain that fits in one context, a single strong model at lower effort
beats a coordinator plus workers.

So stage 04 is carried by the stage agent itself, phase by phase, on the top
tier at medium effort. Delegate only what is genuinely bulk and independent —
many items of an enumerable set in research, fan-out search, running checks.

This also removes the defect class a split produces. A defect between two
individually correct phases is invisible inside either of them: a task can lose
its entire user-visible outcome because the question "which phase sends the
value the reader depends on" belonged to no phase at all. One executor holds
both ends of every seam by construction.

The decomposition into phases still gets no reader of its own, so the checks
below stay.

**Decompose along seams, not along files.** File Ownership says what a phase
writes. The seam says what a phase *assumes another phase will do*. The seam
table in the plan names every hop, so that the executor, the reviewers and the
end-to-end pass all check the same list.

**Read the consumer, never the producer.** Staying out of implementation files is
right and stays. It has exactly one exception: the file that *receives* what the
task produces — the caller, the entry point, the screen. A producer is covered by
its own phase's tests. A consumer is where an assumption lands with nobody
checking it, and it is usually the smallest file in the task.

**Manufacture the pushback.** A human team supplies it free: someone asks who
calls this, someone says the ticket does not add up. Subagents return confident
completion reports instead, and an agent handed a hypothesis hands it back
confirmed. The resistance a real team gives for nothing has to be built here on
purpose — that is what the end-to-end pass in `tms-04b-review` is, and why it is
briefed to prove the path works rather than to look for problems.

Cheap tier: search, inventory, enumeration, running checks, assembling the test
report and the gate page. Top tier: deciding what the task actually is, design,
the decomposition and its seams, writing the code of one chain, any judgement
about what a person will see, and every review pass. Effort, not a weaker model,
is the first lever: medium for routine stages, high where judgement is the
product (design, plan, review, security).

**This section is the doctrine; it is not the enforcement.** A stage runs in a
fresh context and never reads this file, so a rule that lives only here does not
fire. Each consequence above is restated as a checkable line where it applies:
`tms-01-research` (the vertical carries arguments, not layers), `tms-03-plan`
(the seam table, the seam test, the consumer read), `tms-04-implement` (one
executor for the whole chain), `tms-04b-review` (the end-to-end pass),
`tms-06-gate` (the positive stopping rule).

## A screen is not routed through stage 04

When the task changes a **screen** — any component the project lists as a screen
in its accepted-screen register (`AGENTS.md` → *UI And Design*) — stage 04 is
**`tms-ui-screen`**, not `tms-04-implement`. That skill opens the design system
and the nearest accepted screens; the eight code stages never do, and no
reviewer in 04b can see a pixel.

Without an owner, the baseline comparison is never reached: screens drift from
the design system task after task while every stage passes. This routing gives
it one.

Before dispatching, confirm `03_plan.md` carries the registered baseline entries
and the reuse matrix. Missing them, the plan goes back — not the code.

It is dispatched as `tms-stage`, like any stage 04. Projects without a UI skip
this section.

## How a stage gets its fresh context

**The orchestrator dispatches it; the owner does not open chats by hand.** A
stage runs as a subagent this session spawns — the stage agent named in the
table above, which has full tool access — and its first act is to invoke its own
stage skill. Full access, not a restricted role: stages 01, 04 and 04b spawn
agents of their own, and a leaf agent cannot.

This is the only arrangement where the orchestrator can do the job this skill
describes. A subagent it spawned, it can re-brief and send back for the section
that is missing. A chat the owner opened, it cannot reach at all — and then
"collect the artifact and verify it" is something the owner ends up doing.

Run the stage in the background. It takes as long as it takes, the owner keeps
the ability to interrupt, and the completion notice brings the orchestrator back.
Do not poll it, and do not start the next stage while it runs.

**The brief carries addresses, not opinions.** The task id, the working copy, the
stage skill to invoke, the exact paths of the input artifacts, and the owner's
instruction verbatim when there is one. Never your reading of the problem, never
a suspected cause, never a proposed fix, never what the previous stage struggled
with. A stage handed a hypothesis returns it confirmed, and the fresh context was
the entire point.

**Prepare the working copy once, before stage 01.** Every stage of one task works
in the same place, set up the way the project's canon prescribes: its own
worktree or branch, dependencies installed, generated artifacts built. Do it
once and name the path in every brief. A half-prepared working copy does not fail
loudly — it makes tests resolve against the wrong tree, which is green where it
should be red and red where it should be green.

**One exception.** When the owner invokes a single stage directly, there is no
orchestrator and none of this applies: run that stage, write its artifact, stop.

## Running it

1. Confirm which task and where it stands: read `docs/<TASK-ID>/` and see which
   artifacts exist. Resume from the first missing one.
2. Dispatch that stage as its own subagent of the type the table names, briefed
   as the section above requires. For 03, resume the design agent instead.
3. Collect the artifact. Verify it exists and has its required sections filled.
   Do not rewrite its content. A section that is missing or empty goes back to
   that same stage — re-brief it, do not fill it in yourself and do not spawn a
   second stage beside it.
4. At an owner checkpoint: present the artifact, say what decision is needed in
   one line, and stop.
5. After 06, on go: closure happens inside `tms-06-gate`.

## What this orchestrator never does

- Write code, design, or fill the Gate Decision.
- Create a task or a rule. A problem found mid-flight goes to the owner as a
  proposal with justification; the owner decides.
- Restart a stage automatically. If a stage produced something wrong, that is a
  fact for the owner, not a reason to loop.
- Widen scope. File Ownership from `03_plan.md` is the boundary of stage 04;
  crossing it means stopping and asking.
- Delegate the seam map. It is the one artifact no reviewer will catch for you.

## Reporting

Between stages, report in three lines: which stage finished, what it produced,
what is needed next. At a checkpoint, add the one decision the owner must make.

Keep the chat quiet during a stage. Surface a blocker, a decision or a result —
nothing else.
