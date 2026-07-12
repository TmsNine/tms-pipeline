# Delivery Plan: Export reports list to CSV

Date: 2026-01-15

## Inputs
- `02_design.md` (approved), `02b_gap_audit.md` (Class A folded in; one Class B handled here).

## Waves

### Wave 1 — CSV helper + shared query/columns  ·  Profile: R — shared query + CSV injection surface
- Scope: extract `buildReportsQuery(filters, orgId)` and the shared `COLUMNS` definition; add
  `api/src/lib/csv.ts` with `toCsv()` including formula-injection neutralization (Class A fix).
- Files: `api/src/routes/reports.ts`, `api/src/lib/csv.ts`, shared columns module.
- Acceptance: `toCsv()` unit tests pass (incl. injection + escaping); list endpoint still works via the
  extracted query.
- 04b review depth: stress-test CSV escaping/injection handling and list/export query parity.
- Owning R-IDs: R-CSV-01, R-CSV-02.

### Wave 2 — Export endpoint  ·  Profile: R — data-access path that must enforce org scoping
- Scope: `GET /api/reports/export.csv` reusing `buildReportsQuery` with `req.user.orgId`; 10k cap + note
  row when truncated (Class B fix).
- Files: `api/src/routes/reports.ts`.
- Acceptance: integration tests prove org isolation, filter fidelity, and the cap behavior.
- 04b review depth: independently verify org scoping, filter fidelity, and truncation semantics.
- Owning R-IDs: R-CSV-03, R-CSV-04.

### Wave 3 — Frontend button + toast  ·  Profile: M — UI wiring, no new data flow
- Scope: Export `Button` on `ReportsList.tsx` linking to the export URL with active filters; truncation
  toast.
- Files: `web/src/pages/ReportsList.tsx`.
- Acceptance: clicking downloads the filtered CSV; disabled while filters load.
- 04b review depth: narrow diff review for filter propagation and user-visible states.
- Owning R-IDs: R-CSV-02.

## Canonical risk ledger

| R-ID | Business invariant | Trigger / surface | Owner layer | Required proof | Failure signal | Owning wave | Search map |
|---|---|---|---|---|---|---|---|
| R-CSV-01 | Exported cells cannot execute spreadsheet formulas. | CSV serialization of user-controlled values. | `api/src/lib/csv.ts` | Unit tests for `=`, `+`, `-`, `@`, quotes, commas, and newlines. | A generated CSV cell begins with a formula trigger unescaped. | Wave 1 | `toCsv`, `reports/export`, CSV tests and fixtures. |
| R-CSV-02 | List, export, and UI use the same filter semantics. | Shared query plus frontend filter propagation. | `buildReportsQuery(filters, orgId)` and report-list filter state. | Route parity tests and UI smoke with active filters. | The same filters return different row sets or the UI drops a filter. | Waves 1 and 3 | `reports.ts`, `reportsQuery.ts`, route tests, `ReportsList.tsx`. |
| R-CSV-03 | Export never leaks another organization's reports. | Export data-access boundary. | Export route using `req.user.orgId` through shared query. | Integration test with two organizations and the same filters. | CSV contains a report from a different organization. | Wave 2 | `reports/export.csv`, auth fixtures, `buildReportsQuery`. |
| R-CSV-04 | Large exports are capped predictably. | Export response builder and CSV tail row. | Export route response builder. | Endpoint test for the 10k cap and truncation note row. | Response omits the note or streams unlimited rows. | Wave 2 | Export endpoint tests, CSV builder. |

## Risks & mitigations
- Risk: query divergence between list and export. Mitigation: single shared `buildReportsQuery`.

## Rollout / ordering
- Additive; ship Wave 1→3 in order. No migration, no flag.
