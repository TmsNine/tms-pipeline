# Implementation Log: Export reports list to CSV

Date: 2026-01-15

## Wave-by-wave execution

### Wave 1 — CSV helper + shared query/columns
- Profile: R — shared query + CSV injection surface
- Status: pass
- What was done: extracted `buildReportsQuery`; added `toCsv()` with RFC-4180 escaping and formula-injection
  neutralization (cells leading with `= + - @` prefixed with `'`).
- What changed: `api/src/lib/csv.ts` (new), `api/src/routes/reports.ts`, `api/src/lib/reportsQuery.ts` (new).
- Self-check roles covered: Developer / Tester / Architect / Security-Privacy-Money / Reviewer
- Risk-surface sweep: searched CSV formula triggers, shared query call sites, and reports route tests; no
  second export query path found.
- Pre-04b adversarial self-review: invariants covered by CSV unit tests and shared-query route tests; no
  author-found defect left open.
- Validation: CSV unit tests pass, including escaping and formula-injection cases.
- 04b must stress-test: CSV escaping/injection handling and list/export query parity.

### Wave 2 — Export endpoint
- Profile: R — data-access path that must enforce org scoping
- Status: pass
- What was done: `GET /api/reports/export.csv` reusing the shared query with `req.user.orgId`; 10k cap +
  truncation note row.
- What changed: `api/src/routes/reports.ts`.
- Self-check roles covered: Developer / Tester / Architect / Security-Privacy-Money / Reviewer
- Risk-surface sweep: searched org scoping, export route auth fixture setup, cap/truncation handling, and
  route-level mocks; truncation endpoint assertion added before handoff.
- Pre-04b adversarial self-review: org-isolation and cap invariants have route tests; 04b should still
  inspect whether all filters flow through the shared query.
- Validation: export integration tests prove org isolation, filter fidelity, and cap behavior.
- 04b must stress-test: org scoping, filter fidelity, and truncation semantics.

### Wave 3 — Frontend button + toast
- Profile: M — UI wiring, no new data flow
- Status: pass
- What changed: `web/src/pages/ReportsList.tsx`.
- Self-check roles covered: Developer / Tester / Reviewer
- Risk-surface sweep: checked active filter state and loading-state wiring only; no new API semantics.
- Validation: UI smoke proves the download link includes active filters and the loading state is stable.
- 04b must stress-test: narrow diff review for filter propagation and user-visible states.

## 04b handoff — author risk map for 04b to verify and complete
- Resolved task-owned files: `api/src/lib/csv.ts`, `api/src/lib/reportsQuery.ts`,
  `api/src/routes/reports.ts`, `web/src/pages/ReportsList.tsx`, related tests.
- Commit/range for 04b: worktree changes for ACME-101.
- Dangerous invariants: CSV injection neutralization, org scoping, list/export filter parity, 10k cap.
- Searches/risk-surface sweeps performed in 04: CSV trigger characters, shared query call sites, export
  route auth fixtures, frontend active filter propagation.
- Adjacent surfaces checked: list reports endpoint, export endpoint tests, CSV unit tests, UI smoke.
- Validation: `npm test -- csv reports-export`, `npm run typecheck`; no manual launch action.
- Reviewer stress-test prompts: try to prove formula injection is still possible; try to find a route path
  where export skips `req.user.orgId`; try to make list/export filters diverge.

## Deviations from plan
- None.

## Follow-ups captured (per AGENTS.md)
- ACME-118 "Reports export polish" (bundle: toast copy, i18n keys, button loading state) → backlog,
  priority Could.

## Pre-launch manual actions captured
- None (additive, no migration, no env/config).
