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
