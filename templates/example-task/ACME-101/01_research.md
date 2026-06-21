# Research: Export reports list to CSV

Date: 2026-01-15

## Goal
Add a CSV export of the reports list that respects the active filters and the user's permissions.

## As-Is (facts only)
- The reports list is rendered by `web/src/pages/ReportsList.tsx`; it calls the hook
  `useReports(filters)` (`web/src/hooks/useReports.ts`). `confirmed`
- The hook fetches `GET /api/reports?…filters` → handler `api/src/routes/reports.ts:listReports`.
  `confirmed`
- `listReports` already scopes results to the caller via `req.user.orgId` before returning. `confirmed`
- The table columns are defined in `web/src/pages/ReportsList.tsx` as `COLUMNS`. `confirmed`
- There is no existing CSV/export utility anywhere in the repo. `confirmed`
- A shared `Button` primitive exists at `web/src/components/Button.tsx`. `confirmed`

## Vertical path
ReportsList page → useReports hook → `GET /api/reports` → listReports handler → DB query (org-scoped).

## Horizontal surfaces
- The same filter object is the contract between the page and the API — both sides must use it for export.
- The CSV column order must stay in sync with `COLUMNS`.

## Evidence
- Not checked: the exact CSV-escaping needs of fields containing commas/quotes/newlines (to be decided in
  design); whether very large result sets need streaming. `inferred` these matter.

## Open questions / interview
- Export the current filtered page, or all matching rows across pages? → interview asked in chat.
  (Resolved: all matching rows, capped at 10k with a notice — folded into design.)
