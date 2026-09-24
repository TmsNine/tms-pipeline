# ACME-101 — 04b Code review

Date: 2026-01-18
Reviewed diff: `git diff 7b90e11 -- shared/ api/ web/src/pages/ e2e/reports-export.spec.ts` (base 7b90e11)
Passes: 4 of 5 · Outcome: stagnation

Pass 1 — code. Pass 2 — end-to-end: walked the vertical from `01_research.md` for the export and quoted
the supplying line at every hop, from the button's `href` to the download header; no break. Pass 3 — code, after the fix. Pass 4 — code. Passes 3 and 4 changed no
product file and brought only repeated or non-blocking comments: the stagnation rule ended the loop. No
visual pass: the diff adds one existing `Button` and no new screen.

## Blocking findings

| # | File:line | Reproduction on current code | What the user sees | Fix | Status |
|---|---|---|---|---|---|
| B-1 | `api/src/lib/csv.ts:9` | Create a report titled `=HYPERLINK("https://example.test","open")`, export, open the file in a spreadsheet | The cell becomes a live formula link instead of the title text; a report title can make a manager's spreadsheet run a formula | Cells starting with `=`, `+`, `-`, `@`, tab or carriage return get a leading `'`; case added to `csv.test.ts` | fixed in pass 1, confirmed in pass 3 |

## Where the other findings went

| # | File:line | What | Route | Details |
|---|---|---|---|---|
| N-1 | `api/src/routes/reports.ts:69` | Comment above the export route still says "list handler" after the copy | fixed now | Comment corrected; inside File Ownership, one line |
| N-2 | `web/src/pages/ReportsList.tsx:29` | No progress sign while a large export is prepared; near the cap it takes about 4 s and managers press twice | backlog proposal | "Show that the export is being prepared." Double clicks give two downloads and managers already ask which file is the right one |
| N-3 | `api/src/routes/reports.ts:74` | The export builds the whole file in memory | trigger register | Trigger: the first request to raise the 10,000-row cap. At today's cap the file stays under 5 MB; above it, memory per request grows with the cap and a person will notice slow or failed downloads |
| N-4 | `api/src/lib/csv.ts:3` | Rename `toCsv` to `serializeCsv` | dropped | Preference; the name matches `toPdf` in `api/src/lib/pdf.ts` |

## Trust in the tests

- `csv.test.ts` — would fail if escaping or the formula guard regressed; asserts the exact output string;
  mocks nothing.
- `reportsQuery.test.ts` — would fail if an org id from the request reached the query; asserts the
  generated where clause, not a mock call.
- `reports-export.test.ts` — real test database with two orgs; would fail on a cross-org row, a lost filter
  or a missing truncation line; mocks only the session.
- `ReportsList.test.tsx` — asserts the link's `href`; would fail if a filter were dropped.
- `reports-export.spec.ts` — the only test that crosses every seam with no mock; reads the downloaded file.

No behaviour changed without a test.

## Understanding of the change

The export is the list's query without paging, capped at 10,000 rows, serialised by one pure helper with
the table's own column definition. Invariants: org id only from the session; filters only through
`parseReportFilters`; column order only from `REPORT_COLUMNS`. All three reviewers reconstructed this
without help.

## Rejected findings

- Pass 4: "`limit(10001)` is an off-by-one." Rejected: the extra row is how truncation is detected
  (plan, Normative contracts); the cut-at-10,000 test proves 10,000 data rows plus the note.

## Validation

- Before pass 1: `npm run check` → exit 0, `check: 3 packages OK`.
- After the B-1 and N-1 fixes: row 1 → exit 0, `10 passed, 0 failed`; `npm run check` → exit 0.
- Passes 2–4: no product change; no re-run needed.
