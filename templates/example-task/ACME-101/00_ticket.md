# Ticket: Export reports list to CSV

Date: 2026-01-15
Ticket ID: ACME-101

## Driver / Why
Managers want to pull the reports table into a spreadsheet for their weekly review. Today they copy rows
by hand, which is slow and error-prone.

## Scope
- In: a "Export to CSV" button on the reports list page that downloads the currently-filtered rows.
- Out: scheduled/emailed exports; PDF export; exporting other pages.

## Acceptance (observable pass/fail)
1. A visible "Export to CSV" button on the reports list.
2. Clicking it downloads a `.csv` containing exactly the rows matching the active filters.
3. The CSV columns match the visible table columns, in the same order.
4. Only reports the current user is allowed to see are included.

## Source links
- Backlog row: ACME-101
- Product doc: `02 Product/PRD - Reports.md` · Flow: `02 Product/Flow - Reports list.md`

## Task mode
- [x] TDD-first — new behavior + a data-access path that must respect permissions.

## Preconditions checked
- [x] Item exists in the backlog and is the exact target
- [x] Relevant product/architecture docs identified
- [x] Open questions resolved or flagged
