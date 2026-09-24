# ACME-101 — 04 Implementation

Date: 2026-01-17
Plan: docs/ACME-101/03_plan.md

One executor for the whole plan; no phase was handed to a developer subagent.

## Phase 1 — Shared query, columns and CSV helper

Files: `shared/reportColumns.ts`, `api/src/services/reportsQuery.ts`, `api/src/services/reportsQuery.test.ts`,
`api/src/lib/csv.ts`, `api/src/lib/csv.test.ts`, `api/src/routes/reports.ts`

**Done:** `REPORT_COLUMNS`, `parseReportFilters`, `buildReportsQuery` and `toCsv` exactly as in the plan's
contracts. `listReports` now calls `buildReportsQuery(parseReportFilters(req.query), req.user.orgId)` and
adds its paging on top; the inline query is gone.
**Test:** `csv.test.ts` (escaping: comma, quote, newline, empty cell, header order — 5 cases) and
`reportsQuery.test.ts` (org id only from the argument, unknown params dropped, period and status applied,
no filters — 4 cases). Both red first with "Cannot find module" for the two files, as the plan said.
**Checks:** row 1 → exit 0, `9 passed, 0 failed`. Row 2 → exit 0, `Tests: 6 passed` (list unchanged).
**Deviations:** none.

## Phase 2 — Export endpoint

Files: `api/src/routes/reports.ts`, `api/test/reports-export.test.ts`

**Done:** `GET /api/reports/export.csv` under the same `requireUser` router as the list; `limit(10001)`;
first 10,000 rows plus the truncation line when 10,001 came back; headers as in the contract.
**Test:** `reports-export.test.ts`, 5 cases: own org + filtered + header order; cut at 10,000; download
headers; 401 without a session; unknown query params ignored. Red first: 404 on every case (route absent).
**Checks:** row 3 → exit 0, `Tests: 5 passed`.
**Deviations:** none.

## Phase 3 — Export button

Files: `web/src/pages/ReportsList.tsx`, `web/src/pages/ReportsList.test.tsx`, `e2e/reports-export.spec.ts`

**Done:** "Export to CSV" `Button` above the table, rendered as a link to
`/api/reports/export.csv?${new URLSearchParams(filters)}`, disabled while filters load. `COLUMNS` replaced
by `REPORT_COLUMNS`. The end-to-end spec seeds two orgs, clicks the button in a real browser and reads the
downloaded file.
**Test:** "export link carries filters" — red first (no element named "Export to CSV"). Existing 3 cases
now import `REPORT_COLUMNS`.
**Checks:** row 4 → exit 0, `Tests: 4 passed`. Row 6 → exit 0, `1 passed`.
**Deviations:** none.

## Seams

| Seam from the plan | Producer line | Consumer line | Agree |
|---|---|---|---|
| Page → export URL | `ReportsList.tsx:29` `href={'/api/reports/export.csv?' + new URLSearchParams(filters)}` | `reports.ts:71` `router.get('/export.csv', …)` reads `req.query` | yes |
| URL → route | `reports.ts:10` `router.use(requireUser)` sets `req.user` | `reports.ts:72` `req.user.orgId` | yes |
| Route → query | `reports.ts:72` `buildReportsQuery(parseReportFilters(req.query), req.user.orgId)` | `reportsQuery.ts:14` `(filters: ReportFilters, orgId: string)` | yes |
| Query → rows | `reportsQuery.ts:21` selects `id, title, owner, status, createdAt` | `reports.ts:74` `rows.slice(0, 10000)` | yes |
| Rows → file | `reports.ts:76` `toCsv(page, REPORT_COLUMNS)` | `csv.ts:3` `(rows, columns: readonly ReportColumn[])` | yes |
| File → person | `reports.ts:78` `Content-Disposition: attachment; filename="reports.csv"` | `reports-export.spec.ts:22` `page.waitForEvent('download')` | yes |
| List route → query | `reports.ts:31` same call plus `.limit(50).offset(page * 50)` | `reportsQuery.ts:14` | yes |

## Whole-task check

`npm run check` (repo root) → exit 0, `check: 3 packages OK` (build, type-check and tests of `api`, `web`,
`shared`). No red lines.
Security: one pass — the diff touches a tenant predicate and input at a trust boundary (security triggers
in `AGENTS.md`). `tms-security` found one issue: the `period` validation the list and the export share
(`reports.ts:18`) answered 400 with the raw query value inside the message, and the export now reaches it
from a link a person can be sent. Fixed inside `api/src/routes/reports.ts` with a fixed message; the
re-check made no further change, so it was the last one. Org scoping and the guard were confirmed.

## Stops and returns to the owner

None. Nothing outside File Ownership was needed.

## Summary

Phases 1–3 green. 10 files (7 created, 3 changed), about 260 lines added and 40 removed, most of them tests.
