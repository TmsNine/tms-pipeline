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
