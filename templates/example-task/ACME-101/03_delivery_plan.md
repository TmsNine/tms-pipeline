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
- 04 risk-handoff seed:

| Invariant | Required proof/test | Owner layer | Failure signal | Risk search map |
|---|---|---|---|---|
| Exported cells cannot execute spreadsheet formulas. | Unit tests for `=`, `+`, `-`, `@`, quotes, commas, and newlines. | `api/src/lib/csv.ts` | A generated CSV cell begins with a formula trigger unescaped. | `toCsv`, `reports/export`, CSV tests and fixtures. |
| List and export use the same query semantics. | Route tests covering shared filters on list and export. | `buildReportsQuery(filters, orgId)` | Same filters return different row sets. | `reports.ts`, `reportsQuery.ts`, list/export route tests. |

### Wave 2 — Export endpoint  ·  Profile: R — data-access path that must enforce org scoping
- Scope: `GET /api/reports/export.csv` reusing `buildReportsQuery` with `req.user.orgId`; 10k cap + note
  row when truncated (Class B fix).
- Files: `api/src/routes/reports.ts`.
- Acceptance: integration tests prove org isolation, filter fidelity, and the cap behavior.
- 04b review depth: independently verify org scoping, filter fidelity, and truncation semantics.
- 04 risk-handoff seed:

| Invariant | Required proof/test | Owner layer | Failure signal | Risk search map |
|---|---|---|---|---|
| Export never leaks another organization's reports. | Integration test with two orgs and same filters. | Export route using `req.user.orgId` through shared query. | CSV contains a report from a different org. | `reports/export.csv`, auth test fixtures, `buildReportsQuery`. |
| Large exports are capped predictably. | Endpoint test for 10k cap and truncation note row. | Export route response builder. | Response omits truncation note or streams unlimited rows. | export endpoint tests, CSV builder. |

### Wave 3 — Frontend button + toast  ·  Profile: M — UI wiring, no new data flow
- Scope: Export `Button` on `ReportsList.tsx` linking to the export URL with active filters; truncation
  toast.
- Files: `web/src/pages/ReportsList.tsx`.
- Acceptance: clicking downloads the filtered CSV; disabled while filters load.
- 04b review depth: narrow diff review for filter propagation and user-visible states.
- 04 risk-handoff seed: check that UI reuses the active filter state and does not introduce a new data
  access path.

## Risks & mitigations
- Risk: query divergence between list and export. Mitigation: single shared `buildReportsQuery`.

## Rollout / ordering
- Additive; ship Wave 1→3 in order. No migration, no flag.
