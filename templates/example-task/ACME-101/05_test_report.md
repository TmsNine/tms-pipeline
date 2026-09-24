# ACME-101 — 05 Test report

Date: 2026-01-18

## Primary signal

Run by hand on the local stack (`npm run dev`, seeded data), as the plan's manual scenario says:

1. Signed in as a manager of org A. Opened Reports, set Status = Open, Period = 2025-12. The list showed
   "42 reports".
2. Pressed "Export to CSV". `reports.csv` downloaded.
3. Opened it in a spreadsheet: header `Title, Owner, Status, Created`, 42 data rows, all Status = Open, none
   of org B's titles. The seeded title `=HYPERLINK(...)` shows as plain text.

Evidence: `docs/ACME-101/evidence/export-org-a.png`, `docs/ACME-101/evidence/reports.csv`.

Not run live: the same on production with real data — see "Manual runtime smoke".

## Checks run

| # | Command | Directory | Exit code | Marker from the plan found | Verdict |
|---|---|---|---|---|---|
| 1 | `npm test --workspace api -- src/lib/csv.test.ts src/services/reportsQuery.test.ts` | repo root | 0 | yes — `10 passed, 0 failed` | green |
| 2 | `npm test --workspace api -- test/reports.test.ts` | repo root | 0 | yes — `Tests: 6 passed` | green |
| 3 | `TZ=UTC npm test --workspace api -- test/reports-export.test.ts` | repo root | 0 | yes — `Tests: 5 passed` | green |
| 4 | `npm test --workspace web -- src/pages/ReportsList.test.tsx` | repo root | 0 | yes — `Tests: 4 passed` | green |
| 5 | `npm run check` | repo root | 0 | yes — `check: 3 packages OK` | green |
| 6 | `TZ=UTC npm run e2e -- reports-export.spec.ts` | repo root | 0 | yes — `1 passed` | green |

Rows in the plan: `6`. Rows here: `6`. No mismatch.

## Secondary signal

Row 5 is the project's task check: build, type-check and all tests of `api`, `web` and `shared` — 212
tests, 0 failed. Logs: `.scratch/ACME-101/check.log`. Lint is part of the same command: 0 problems.

## Known caveats

None. The known-test-debt register (read from the main branch) lists nothing under `api`, `web` or
`shared`, and nothing was red.

## Not run

- Export on production with real data volume — needs the production environment, which this stage does
  not have. Goes to the gate as unverified.

## Manual runtime smoke

After rollout, a manager exports a filtered list on production and compares the row count with the list's
total. Recorded in the launch playbook (`AGENTS.md` → *Pre-Launch Manual Action Capture*):
`docs/playbook/rollout.md`, step "ACME-101 — reports CSV export smoke".
