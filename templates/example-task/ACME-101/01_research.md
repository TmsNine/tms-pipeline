# ACME-101 — 01 Research

Date: 2026-01-15
Base SHA: 4f1c2a9

## Goal of this stage

Trace how the reports list gets its rows today, from the filters a manager sets to the database and back
to the table.

## Vertical

| Layer | File:line | What it does now | Hands on |
|---|---|---|---|
| Page | `web/src/pages/ReportsList.tsx:18` | Holds the filter state `{ period, status }` and renders `COLUMNS` in a table | `filters` object to `useReports(filters)` |
| Hook | `web/src/hooks/useReports.ts:9` | Serialises `filters` with `URLSearchParams` and calls the API | query string `?period=…&status=…` |
| Route and guard | `api/src/routes/reports.ts:12` | `GET /api/reports` behind `requireUser` | `req.query`, `req.user.orgId` to `listReports` |
| Handler | `api/src/routes/reports.ts:27` | `listReports` builds the query inline from `req.query.period`, `req.query.status` and `req.user.orgId` | `{ period, status, orgId }` to the query |
| Persistence | `api/src/routes/reports.ts:34` | `db.select().from(reports).where(orgId = …, period, status).limit(50).offset(page * 50)` | rows `{ id, title, owner, status, createdAt }` |
| Back to the page | `web/src/pages/ReportsList.tsx:41` | Maps rows through `COLUMNS` (`title`, `owner`, `status`, `createdAt`) into table cells | rendered table |

No hop is broken: every row hands something to the next.

## Neighbours

- `GET /api/reports/:id` (`api/src/routes/reports.ts:58`) — also scoped by `req.user.orgId`, same guard.
- `requireUser` (`api/src/middleware/auth.ts:5`) — sets `req.user` from the session; the only guard on
  these routes.
- Tests: `api/test/reports.test.ts` (list endpoint, 6 cases, one of them checks org isolation);
  `web/src/pages/ReportsList.test.tsx` (renders the table, 3 cases).
- Loading state: `ReportsList.tsx:22` shows a skeleton while `useReports` is loading.

## Exact places

- `web/src/pages/ReportsList.tsx:18`, `:41` (`COLUMNS` is declared at `:8`)
- `web/src/hooks/useReports.ts:9`
- `api/src/routes/reports.ts:12`, `:27`, `:34`
- `api/test/reports.test.ts`
- `web/src/pages/ReportsList.test.tsx`

## Precedents in the code

- A file download already exists: `GET /api/invoices/:id/pdf` (`api/src/routes/invoices.ts:40`) sets
  `Content-Disposition: attachment; filename=…` and sends a buffer.
- Org scoping by `req.user.orgId` taken from the session, never from the request, in every route under
  `api/src/routes/` (see the enumerable set below).

## Data and schema state

Table `reports` (`api/db/schema.ts:22`): `id`, `org_id` (not null, indexed), `title`, `owner`, `status`,
`created_at`. No migration needed to read it.

## Enumerable sets

Routes under `api/src/routes/` that read org data — source: `ls api/src/routes/`, 3 files, 5 routes.

| Route | File:line | Org id taken from |
|---|---|---|
| `GET /api/reports` | `reports.ts:12` | `req.user.orgId` |
| `GET /api/reports/:id` | `reports.ts:58` | `req.user.orgId` |
| `GET /api/invoices` | `invoices.ts:10` | `req.user.orgId` |
| `GET /api/invoices/:id/pdf` | `invoices.ts:40` | `req.user.orgId` |
| `GET /api/users/me` | `users.ts:6` | `req.user.orgId` |

## Absent — checked

- A CSV helper: opened `api/src/lib/` (4 files: `db.ts`, `errors.ts`, `pdf.ts`, `time.ts`) — none writes
  CSV.
- An export button: opened `web/src/pages/ReportsList.tsx` in full — no download action.

## Not found by search

- `grep -rn "csv" web/src` returned nothing. This does not prove the frontend has no CSV code under
  another name; nothing in design rests on it.

## Open questions for design

1. Export the current page (50 rows) or all matching rows?
2. Is there an upper limit for one export?
3. Where should the column order come from, so the file cannot drift from the table?
