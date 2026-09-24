# ACME-101 — 06 Review gate

Date: 2026-01-19

## Gate decision

conditional_go — signed by the lead, 2026-01-19. Condition: after rollout, the production export smoke
passes (row count in the file equals the list's total, own org only). Closed by `docs/playbook/rollout.md`,
step "ACME-101 — reports CSV export smoke".

Why the lead may sign it: only execution remains. No product fork was left open, the change is additive and
reversible, no data or money is at risk beyond what the tests already cover, and the owner is asked for no
work.

## Proof that the task works

`TZ=UTC npm run e2e -- reports-export.spec.ts` (repo root) → exit 0, `1 passed`: a real browser signed in as
org A pressed "Export to CSV" against the real API and a test database with two orgs; the downloaded file
had the header in table order, exactly the filtered rows, and no row of org B. The same by hand on the
local stack: 42 of 42 rows (`05_test_report.md`, Primary signal). Not yet seen on production — that is the
condition above.

## Acceptance review

| ID from 02 | Behaviour | Done | Evidence |
|---|---|---|---|
| AC-1 | "Export to CSV" button on the reports list | yes | `ReportsList.test.tsx`; manual scenario step 2 |
| AC-2 | File = rows the active filters match, across pages | yes | `reports-export.test.ts`; 42 of 42 rows by hand |
| AC-3 | Columns and order = the table's | yes | header test; one `REPORT_COLUMNS` for both |
| AC-4 | Never another org's reports | yes | two-org integration test; end-to-end spec; security pass |
| AC-5 | Above 10,000 rows: first 10,000 plus a note line | yes | "cuts at 10,000" test |

## What 04b did

4 of 5 passes, ended by the stagnation rule. One blocking finding, fixed in the loop: a report title
starting with `=` became a live spreadsheet formula (B-1).

| # | What | Route | Details |
|---|---|---|---|
| N-1 | Stale comment above the export route | fixed now | Corrected |
| N-2 | No progress sign while a large export is prepared | backlog proposal | See "Proposed follow-ups" |
| N-3 | The file is built in memory | trigger register | Trigger: the first request to raise the 10,000-row cap |
| N-4 | Rename `toCsv` | dropped | Preference; matches `toPdf` |

No blocking finding is left open.

## Validation summary

Primary signal: seen by hand on the local stack and by the end-to-end spec; not yet on production.
Secondary signal: 6 of 6 plan rows green with exit code and marker; task check green (212 tests).
Not run: the production smoke — the `conditional_go` condition.

## Left for a human

- Rollout of the commit — `docs/playbook/rollout.md`, the regular release steps.
- Production export smoke — `docs/playbook/rollout.md`, step "ACME-101 — reports CSV export smoke".
- No migration, no environment change.

## Proposed follow-ups

- **Show that the export is being prepared** (from 04b, N-2) — near the 10,000-row cap the download takes
  about 4 seconds with no sign on the button, so managers press twice and get two files. Add to the
  backlog? yes / no
