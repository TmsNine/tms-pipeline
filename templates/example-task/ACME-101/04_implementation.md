# Implementation Log: Export reports list to CSV

Date: 2026-01-15

## Scope and fingerprints
- Evidence note: the base and fingerprints in this documentation-only worked example are illustrative,
  format-valid values; a real task must record actual `task-fingerprint.mjs` output.
- Base SHA: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`.
- Task-owned tracked paths: reports API/UI source, tests, and `docs/ACME-101/`.
- Task-owned untracked paths: `api/src/lib/csv.ts`, `api/src/lib/reportsQuery.ts`.
- Starting implementation fingerprint: `sha256:1111111111111111111111111111111111111111111111111111111111111111`.
- Final implementation fingerprint: `sha256:2222222222222222222222222222222222222222222222222222222222222222`.
- Package fingerprint (normalized evidence fields): `sha256:4444444444444444444444444444444444444444444444444444444444444444`.
- Fingerprint helper: `tms-task-fingerprint-v1`; source: `worktree`; base: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`.
- Implementation manifest (one repo-relative POSIX path per line):

```text
api/src/lib/csv.ts
api/src/lib/reportsQuery.ts
api/src/routes/reports.test.ts
api/src/routes/reports.ts
web/src/pages/ReportsList.tsx
```

- Package manifest: the implementation paths above plus these repo-local pipeline paths:

```text
docs/ACME-101/00_ticket.md
docs/ACME-101/01_research.md
docs/ACME-101/02_design.md
docs/ACME-101/02b_gap_audit.md
docs/ACME-101/03_delivery_plan.md
docs/ACME-101/04_implementation.md
docs/ACME-101/04b_loop_review.md
docs/ACME-101/05_test_report.md
docs/ACME-101/06_review_gate.md
```

## Wave-by-wave execution

### Wave 1 — CSV helper + shared query/columns
- Profile: R — shared query + CSV injection surface
- Integration owner: lead; code owner: Developer agent.
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

| Role | Self-check / dispatched | Preferred model | Configured/default | Actual | Permission source/evidence |
|---|---|---|---|---|---|
| Developer | dispatched | Sonnet | `sonnet` | `runtime-selected/unknown` | copied project agent: `acceptEdits`; parent override unknown |
| Tester | dispatched | Sonnet | `sonnet` | `runtime-selected/unknown` | copied project agent: `dontAsk`; parent override unknown |
| Architect | dispatched | Opus | `opus` | `runtime-selected/unknown` | copied project agent: `plan`; parent override unknown |
| Security / Privacy / Money | dispatched | Opus | `opus` | `runtime-selected/unknown` | copied project agent: `plan`; parent override unknown |
| Reviewer | dispatched | Sonnet | `sonnet` | `runtime-selected/unknown` | copied project agent: `plan`; parent override unknown |

### Wave 2 — Export endpoint
- Profile: R — data-access path that must enforce org scoping
- Integration owner: lead; code owner: Developer agent.
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
- Integration owner and code owner: lead inline; no coding mob.
- Status: pass
- What changed: `web/src/pages/ReportsList.tsx`.
- Self-check roles covered: Developer / Tester / Reviewer
- Risk-surface sweep: checked active filter state and loading-state wiring only; no new API semantics.
- Validation: UI smoke proves the download link includes active filters and the loading state is stable.
- 04b must stress-test: narrow diff review for filter propagation and user-visible states.

## R/X/V evidence

| R-ID | Invariant | Owner layer | Required proof | Result |
|---|---|---|---|---|
| R-CSV-01 | Formula cells cannot execute. | CSV helper | CSV unit tests | PASS |
| R-CSV-02 | List/export filters match. | Shared reports query | Route parity tests | PASS |
| R-CSV-03 | Export stays organization-scoped. | Export route/shared query | Two-org integration test | PASS |
| R-CSV-04 | Large export is capped with a note. | Export response builder | Endpoint cap test | PASS |

| X-ID | Newly exposed risk | Evidence | Disposition |
|---|---|---|---|
| X-04-01 | Endpoint test originally omitted the truncation note row. | Author self-review of route tests. | Fixed before 04b handoff. |

| V-ID | Command / signal | Scope | Implementation fingerprint | Result | Fresh/reused | Covers |
|---|---|---|---|---|---|---|
| V-04-01 | `npm test -- csv reports-export` | API CSV/export | `sha256:2222222222222222222222222222222222222222222222222222222222222222` | PASS | fresh | R-CSV-01..04, X-04-01 |
| V-04-02 | `npm run typecheck` | API + web | `sha256:2222222222222222222222222222222222222222222222222222222222222222` | PASS | fresh | AC |

## 04b handoff — orchestrator-only author risk map
- Reviewer isolation: 04b audits this section but sends the scoring reviewer only the current contract,
  exact scope/fingerprint, neutral invariants/surfaces, constraints, and validation expectations.
- Resolved task-owned files: `api/src/lib/csv.ts`, `api/src/lib/reportsQuery.ts`,
  `api/src/routes/reports.ts`, `web/src/pages/ReportsList.tsx`, related tests.
- Base SHA and task-owned scope for 04b: worktree changes for ACME-101 from the recorded illustrative base.
- Dangerous invariants: CSV injection neutralization, org scoping, list/export filter parity, 10k cap.
- Searches/risk-surface sweeps performed in 04: CSV trigger characters, shared query call sites, export
  route auth fixtures, frontend active filter propagation.
- Adjacent surfaces checked: list reports endpoint, export endpoint tests, CSV unit tests, UI smoke.
- Validation: `npm test -- csv reports-export`, `npm run typecheck`; no manual launch action.
- Final implementation fingerprint for 04b: `sha256:2222222222222222222222222222222222222222222222222222222222222222`.
- Package fingerprint (normalized evidence fields) and task-owned manifest: `sha256:4444444444444444444444444444444444444444444444444444444444444444`; paths listed above.
- Reviewer stress-test prompts: try to prove formula injection is still possible; try to find a route path
  where export skips `req.user.orgId`; try to make list/export filters diverge.

## Deviations from plan
- None.

## Follow-ups captured (per AGENTS.md)
- ACME-118 "Reports export polish" (bundle: toast copy, i18n keys, button loading state) → backlog,
  priority Could.

## Pre-launch manual actions captured
- None (additive, no migration, no env/config).
