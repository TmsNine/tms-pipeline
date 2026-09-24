# ACME-101 — 03 Plan

Date: 2026-01-16
Design: docs/ACME-101/02_design.md
Base SHA: 7b90e11
Status: APPROVED
Signed by the lead: 2026-01-16

## Plan

| Phase | What we do | How we prove it |
|---|---|---|
| 1 — Shared query, columns and CSV helper | Extract `buildReportsQuery` and `REPORT_COLUMNS`; add `toCsv` | Validation rows 1–2 |
| 2 — Export endpoint | `GET /api/reports/export.csv` on top of phase 1 | Validation row 3 |
| 3 — Export button | Button on the reports list pointing at the endpoint with active filters | Validation row 4 |

## Normative contracts

```ts
// shared/reportColumns.ts
export type ReportColumn = { key: 'title' | 'owner' | 'status' | 'createdAt'; label: string };
export const REPORT_COLUMNS: readonly ReportColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];

// api/src/services/reportsQuery.ts
export type ReportFilters = { period?: string; status?: string };
export function parseReportFilters(query: Record<string, unknown>): ReportFilters; // keeps only period, status
export function buildReportsQuery(filters: ReportFilters, orgId: string): ReportsQuery; // always where org_id = orgId

// api/src/lib/csv.ts
export function toCsv(rows: Record<string, unknown>[], columns: readonly ReportColumn[]): string;
// header line = labels; lines joined by "\r\n"; a cell containing , " \r or \n is wrapped in "…" with " doubled
```

Export endpoint: `GET /api/reports/export.csv`, guard `requireUser`, org id only from `req.user.orgId`,
filters only through `parseReportFilters(req.query)`. Query `limit(10001)`; if 10,001 rows came back,
send the first 10,000 and then the line `Truncated: first 10000 rows`. Response `200`,
`Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="reports.csv"`.

Export URL on the page: `/api/reports/export.csv?` + `new URLSearchParams(filters)` — the same
serialisation `useReports` uses (`web/src/hooks/useReports.ts:9`).

## Execution order

1 → 2 → 3. Phase 2 consumes all three contracts from phase 1; phase 3 consumes the endpoint of phase 2.
The list keeps working after phase 1 on its own, so each phase can be left alone when green.

## File Ownership

| File | Phase | Create / change | Why |
|---|---|---|---|
| `shared/reportColumns.ts` | 1 | create | One column definition for table and file |
| `api/src/services/reportsQuery.ts` | 1 | create | One query definition for list and export |
| `api/src/services/reportsQuery.test.ts` | 1 | create | RED test for the extraction |
| `api/src/lib/csv.ts` | 1 | create | `toCsv` |
| `api/src/lib/csv.test.ts` | 1 | create | RED test for escaping |
| `api/src/routes/reports.ts` | 1, 2 | change | List uses the extracted query (1); export route (2) |
| `api/test/reports-export.test.ts` | 2 | create | Integration tests for AC-2..AC-5 |
| `web/src/pages/ReportsList.tsx` | 3 | change | Button; `COLUMNS` replaced by `REPORT_COLUMNS` |
| `web/src/pages/ReportsList.test.tsx` | 3 | change | Button test |
| `e2e/reports-export.spec.ts` | 3 | create | The seam-crossing check |

No new tools, scripts or dependencies.

## Data flow

Filters on the page → `URLSearchParams` → export route → `parseReportFilters` → `buildReportsQuery(…,
req.user.orgId)` → rows → `toCsv(rows, REPORT_COLUMNS)` → download.

## Seams

| Hop | What is handed on | Change / unchanged | Owning phase |
|---|---|---|---|
| Page → export URL | `filters` as query string | change | 3 |
| URL → route | `req.query`, `req.user.orgId` | change (new route) | 2 |
| Route → query | `parseReportFilters(req.query)`, `req.user.orgId` | change | 1 (contract), 2 (call) |
| Query → rows | rows `{ id, title, owner, status, createdAt }` | unchanged (moved) | 1 |
| Rows → file | `toCsv(rows, REPORT_COLUMNS)` | change | 1 (helper), 2 (call) |
| File → person | `Content-Disposition` download | change | 2 |
| List route → query | same as above, plus paging | change (moved) | 1 |

## Risks and mitigations

| Risk | Mitigation | Sign that it happened |
|---|---|---|
| Extraction changes what the list returns | Existing 6 list tests stay unchanged and run in row 2 | A list test goes red |
| Export takes an org id from the request | Contract: org id only from `req.user.orgId`; filters only via `parseReportFilters` | Integration test with two orgs shows the other org's row |
| File columns drift from the table | Both read `REPORT_COLUMNS` | Header test fails |

## Validation strategy

| # | Phase | What it proves | Command | Run from directory | Green = |
|---|---|---|---|---|---|
| 1 | 1 | `toCsv` escaping; query keeps org scope and drops unknown params | `npm test --workspace api -- src/lib/csv.test.ts src/services/reportsQuery.test.ts` | repo root | exit 0 and `0 failed` |
| 2 | 1 | The list behaves as before the extraction | `npm test --workspace api -- test/reports.test.ts` | repo root | exit 0 and `Tests: 6 passed` |
| 3 | 2 | Export: filters, own org only, header order, cut at 10,000 | `TZ=UTC npm test --workspace api -- test/reports-export.test.ts` | repo root | exit 0 and `Tests: 5 passed` |
| 4 | 3 | The button carries the active filters | `npm test --workspace web -- src/pages/ReportsList.test.tsx` | repo root | exit 0 and `Tests: 4 passed` |
| 5 | all | Task check: build and type-check of `api`, `web` and `shared`, all their tests | `npm run check` | repo root | exit 0 and `check: 3 packages OK` |
| 6 | all | Crosses every seam with no mock: real browser, real API, test database with two orgs | `TZ=UTC npm run e2e -- reports-export.spec.ts` | repo root | exit 0 and `1 passed` |

### Manual scenario

1. Sign in as a manager of org A on the local stack (`npm run dev`, seeded data).
2. Open Reports, set Status = Open and Period = last month. Note the total under the table.
3. Press "Export to CSV" and open the file in a spreadsheet.
4. Expect: the same number of data rows as the total, the columns Title, Owner, Status, Created in that
   order, no report of org B.

## Fresh-reader check

`tms-reviewer` in `PLAN` mode read this plan cold. Compared the contracts with each other, every phase with
File Ownership, the plan with the design, and every piece of work with the owner the project prescribes.
Found two things, both fixed before signing:

- Phase 3 replaced `COLUMNS` in `ReportsList.tsx`, but `ReportsList.test.tsx` imported `COLUMNS` and was
  not listed → added to File Ownership under phase 3.
- The truncation line said "10,000" in the design and `10000` here → the plan's `10000` is the contract;
  the design text is prose.

The button reuses the existing `Button` primitive and adds no new visual element, so no screen work is
routed to `tms-ui-screen`.

## Proof of executability

| Phase | File and test | Setup → action → assertion | Command | Why it will be red |
|---|---|---|---|---|
| 1 | `api/src/lib/csv.test.ts` — "escapes comma, quote and newline" | rows `[{ title: 'a,"b"', owner: 'x\ny', status: 'open', createdAt: '2026-01-01' }]` → `toCsv(rows, REPORT_COLUMNS)` → equals `'Title,Owner,Status,Created\r\n"a,""b""","x\ny",open,2026-01-01'` | row 1 | `api/src/lib/csv.ts` does not exist |
| 1 | `api/src/services/reportsQuery.test.ts` — "org id comes only from the argument" | `parseReportFilters({ status: 'open', orgId: 'B' })` → `buildReportsQuery(that, 'A').toSQL()` → where clause has `org_id = 'A'` and no `'B'` | row 1 | `api/src/services/reportsQuery.ts` does not exist |
| 2 | `api/test/reports-export.test.ts` — "own org, filtered, header in order" | seed org A: 3 open + 2 closed, org B: 2 open; session of org A → `GET /api/reports/export.csv?status=open` → 200, `text/csv`, 4 lines, first line `Title,Owner,Status,Created`, no org B title | row 3 | route returns 404: the export route does not exist |
| 2 | same file — "cuts at 10,000" | seed 10,001 rows for org A → GET → 10,002 lines, last `Truncated: first 10000 rows` | row 3 | route does not exist |
| 3 | `web/src/pages/ReportsList.test.tsx` — "export link carries filters" | render with `{ status: 'open', period: '2026-01' }` → find link "Export to CSV" → `href` is `/api/reports/export.csv?status=open&period=2026-01` | row 4 | the button does not exist |
