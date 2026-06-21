# Delivery Plan: Export reports list to CSV

Date: 2026-01-15

## Inputs
- `02_design.md` (approved), `02b_gap_audit.md` (Class A folded in; one Class B handled here).

## Waves

### Wave 1 — CSV helper + shared query/columns  ·  Escort: B — non-trivial logic, no auth surface
- Scope: extract `buildReportsQuery(filters, orgId)` and the shared `COLUMNS` definition; add
  `api/src/lib/csv.ts` with `toCsv()` including formula-injection neutralization (Class A fix).
- Files: `api/src/routes/reports.ts`, `api/src/lib/csv.ts`, shared columns module.
- Acceptance: `toCsv()` unit tests pass (incl. injection + escaping); list endpoint still works via the
  extracted query.

### Wave 2 — Export endpoint  ·  Escort: C — data-access path that must enforce org scoping
- Scope: `GET /api/reports/export.csv` reusing `buildReportsQuery` with `req.user.orgId`; 10k cap + note
  row when truncated (Class B fix).
- Files: `api/src/routes/reports.ts`.
- Acceptance: integration tests prove org isolation, filter fidelity, and the cap behavior.

### Wave 3 — Frontend button + toast  ·  Escort: A — UI wiring, no new data flow
- Scope: Export `Button` on `ReportsList.tsx` linking to the export URL with active filters; truncation
  toast.
- Files: `web/src/pages/ReportsList.tsx`.
- Acceptance: clicking downloads the filtered CSV; disabled while filters load.

## Risks & mitigations
- Risk: query divergence between list and export. Mitigation: single shared `buildReportsQuery`.

## Rollout / ordering
- Additive; ship Wave 1→3 in order. No migration, no flag.
