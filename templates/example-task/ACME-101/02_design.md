# ACME-101 — 02 Design

Date: 2026-01-15
Base SHA: 4f1c2a9
Status: APPROVED

## Inputs

`00_ticket.md`, `01_research.md`; precedent `GET /api/invoices/:id/pdf` (`api/src/routes/invoices.ts:40`)
for the download response; the org-scoping rule every route follows (research, enumerable set).

## Owning sources and boundaries

Owning layer: the API. The export must return exactly what the list returns, so it belongs next to
`listReports` and must use the same query and the same org scope — not a second query written for the
file, and not a client-side export of the rows already loaded (that would only ever see one page).
Boundaries: the list endpoint's behaviour and paging stay as they are; no other page gets an export; no
schema change.

## Owner's decision

- Export the page on screen or all matching rows? → owner: "All matching rows — they filter first, then
  export. Cap it if needed, but tell them." → the export ignores paging, stops at 10,000 rows and says so
  inside the file.

## Solution

Extract the list's query into one function `buildReportsQuery(filters, orgId)` and the table's columns
into one shared `REPORT_COLUMNS` definition. The list and a new endpoint `GET /api/reports/export.csv`
both call that function; the endpoint drops paging, caps at 10,000 rows and serialises with a small pure
`toCsv(rows, columns)`. The page gets an "Export to CSV" button that points at the endpoint with the
active filters. Rejected: exporting in the browser from loaded rows (sees one page only); a separate SQL
query for the export (two queries drift, and a second place can forget the org scope).

## Acceptance contract

| ID | Who | Before | After |
|---|---|---|---|
| AC-1 | Manager | No way to download the list | An "Export to CSV" button on the reports list |
| AC-2 | Manager | — | The file holds exactly the rows the active filters match, across all pages |
| AC-3 | Manager | — | The file's columns and their order are the table's columns and order |
| AC-4 | Manager | — | The file never contains another organisation's reports |
| AC-5 | Manager | — | Above 10,000 matching rows the file holds the first 10,000 and a last line saying it was cut |

## Design by layer

### API contract
New: `GET /api/reports/export.csv?period=&status=` → `200 text/csv; charset=utf-8`, header
`Content-Disposition: attachment; filename="reports.csv"`. Same query parameters as `GET /api/reports`.

### Route and permissions
Same guard as the list: `requireUser`. Org id only from `req.user.orgId`.

### Service
`buildReportsQuery(filters, orgId)` — the one query definition; the list adds paging on top, the export
adds `limit(10001)` to detect truncation.

### Persistence and migrations
Unchanged. No migration.

### External effects (messaging, payments, queues)
Unchanged.

### UI
A `Button` (existing primitive) above the table, disabled while filters are loading; it is a plain link
to the export URL built from the same `filters` object the hook uses.

## TDD matrix

| Behaviour | Test | Level | What it proves |
|---|---|---|---|
| Cells with commas, quotes, newlines survive | `api/src/lib/csv.test.ts` | unit | `toCsv` escapes by RFC 4180 |
| List still returns the same rows after extraction | `api/test/reports.test.ts` (existing 6 cases) | integration | extraction changed nothing |
| Export = filtered rows, own org only | `api/test/reports-export.test.ts` | integration | AC-2, AC-4 |
| Header row = table columns in order | `api/test/reports-export.test.ts` | integration | AC-3 |
| Cut at 10,000 with a note line | `api/test/reports-export.test.ts` | integration | AC-5 |
| Button carries the active filters | `web/src/pages/ReportsList.test.tsx` | component | AC-1 |
| Click → real file from the real API | `e2e/reports-export.spec.ts` | end-to-end | the whole path, no mocks |

## Rollout and rollback

Purely additive: new endpoint, new button, no migration. Rollback is reverting the commit. Sign of
failure: the export returns 500 or a file whose row count differs from the list's total.

## Resolved questions

1. Page or all rows → all matching rows (owner).
2. Upper limit → 10,000 rows, with a note line (owner agreed to a cap; the number is ours: it keeps the
   response in memory under 5 MB at today's column widths).
3. Column order → one shared `REPORT_COLUMNS` used by the table and the export.

Approved by the owner: 2026-01-15 ("Approved, go ahead.")
