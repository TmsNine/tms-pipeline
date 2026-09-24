---
name: tms-05-test
description: Run and report the task's validation, separating the primary user-visible signal from the secondary code signals. Use after implementation and independent review, before the gate. Produces docs/TASK-ID/05_test_report.md. Do not use to fix failures or to decide whether the task passes.
---

# TMS 05 — Test report

Stage 7 of 8. Runs the checks and reports what they actually showed.

## Two signals, named by weight

**Primary signal** — the user-visible scenario, run for real. A person using the
product does the thing and the right thing happens. Screenshot, log line, the
message that arrived.

**Secondary signal** — targeted tests, typecheck, lint, build of the touched
app. These see for the owner what the owner cannot see: the owner may not be a
programmer, and the backend has no other witness.

Both are required. Neither substitutes for the other. A green suite does not
prove a user flow works; a working demo does not prove the code is sound.

## Steps

1. Take the `Validation strategy` table from `03_plan.md`. Run **every row**,
   as written, from the directory the row names. Not a subset, not a rewritten
   variant, not "this one is like its neighbour". A row the plan wrote wrong is
   a fact for the gate — run it, record what happened, and say it was wrong.
2. **Record the exit code of every row, and separately whether the marker the
   plan named actually appeared in the output.** Both. A wrapper that prints
   success while returning non-zero is why these are two columns and not one.
3. **Run the project's task check once, in the task's working copy**
   (`AGENTS.md` → *Testing And Validation*). It covers what plans keep
   forgetting: build and types for every touched package, tests under the right
   conditions, and whatever else the project bundles into it. Paste its summary
   lines and where its logs are. It adds to the plan's rows; it never replaces
   one. A check it skips (no container runtime, no production environment) goes
   to "Not run" with its reason.
4. Run the manual scenario from the plan. Capture the evidence.
5. **Before calling any red test your regression, check the known-test-debt
   register** (`AGENTS.md` → *Testing And Validation*). Listed there — name it as
   known and move on. Not listed — it is yours. A listed suite is still run and
   still gets an exit code; the register excuses the colour, not the run. Read
   the register from the main branch (`git show <main>:<register path>`): a task
   branch's copy lags.
6. Report what ran and what it returned. Do not fix anything here.
7. Report unrun signals separately. "Not run" is an honest and required answer;
   silently omitting it is not.

## What this stage cannot end on

The report is not written until every row of the `Validation strategy` table in
`03_plan.md` has an exit code in the `Checks run` table. The counts match: as
many rows in the report as in the plan, and this is checked by counting, not by
impression.

**A red result ends the stage.** Red is a fact for the gate, not a reason to fix
something here. What does not end the stage is the **absence** of a result.

A row closes without an exit code in exactly two cases, and there are no others:

- **The command needs a live environment the stage does not have.** Then the row
  moves to "Not run" with its reason named and goes to the gate as unverified.
  Not as "probably fine".
- **A manual-scenario row** — it has no exit code by nature; its evidence is a
  screenshot, a log line or the message that arrived.

Lack of time, "the command is slow" and "obviously green" are not on this list.
That is exactly how a build row goes missing and walks past every later stage
and every review pass unnoticed.

## Artifact template

Write the artifact in the project's output language (`AGENTS.md` → *Operating
Standard*); translate the headings below if it is not English.

```markdown
# <TASK-ID> — 05 Test report

Date: <YYYY-MM-DD>

## Primary signal

The scenario that was run by hand, step by step. What was seen. Evidence:
screenshot, log line, the message that arrived.

If it cannot be run live — name the reason and name the check that crosses all
seams and stands in its place: command and result. "Not run" without such a
substitute means the primary signal is verified by nothing, and it goes to the
gate exactly like that.

## Checks run

One row per row of `Validation strategy` in `03_plan.md`, in the same order and
the same number.

| # | Command | Directory | Exit code | Marker from the plan found | Verdict |
|---|---|---|---|---|---|

Rows in the plan: `<N>`. Rows here: `<N>`. Any mismatch is named explicitly.

## Secondary signal

Targeted tests, typecheck, lint, build of the touched app — the summary.

## Known caveats

Red suites from the known-test-debt register that do not relate to the task.
With a link to the register row.

## Not run

Signals that were not run, and why. Empty is an answer too.

## Manual runtime smoke

What remains to be checked on a live environment and by whom. Manual steps go
to the launch playbook (`AGENTS.md` → *Pre-Launch Manual Action Capture*).
```

## Stage boundary

Done when the report is written. Next: `tms-06-gate`.

Do not fix failures here. A failure is a fact for the gate; the owner decides
what happens to it.
