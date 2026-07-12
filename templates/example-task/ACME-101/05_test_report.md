# Test Report: Export reports list to CSV

Date: 2026-01-15

## Freshness
- 04b normalized status: `PASS`.
- Implementation fingerprint: `sha256:3333333333333333333333333333333333333333333333333333333333333333` / accepted 04b `sha256:3333333333333333333333333333333333333333333333333333333333333333` — match.
- Package fingerprint (normalized evidence fields): `sha256:5555555555555555555555555555555555555555555555555555555555555555`.
- Fingerprint helper: `tms-task-fingerprint-v1`; source: `worktree`; manifests match stage 04.

## Automated checks
| V-ID | Type | Command | Implementation fingerprint | Result | Covers |
|---|---|---|---|---|---|
| V-05-01 | Targeted tests | `npm test -- csv reports-export` | `sha256:3333333333333333333333333333333333333333333333333333333333333333` | PASS (13 tests) | AC, R-CSV-01..04 |
| V-05-02 | Typecheck | `npm run typecheck` | `sha256:3333333333333333333333333333333333333333333333333333333333333333` | PASS | AC |
| V-05-03 | Lint | `npm run lint` | `sha256:3333333333333333333333333333333333333333333333333333333333333333` | PASS | changed surface |
| V-05-04 | Build | `npm run build` | `sha256:3333333333333333333333333333333333333333333333333333333333333333` | PASS | API + web |

Coverage of note:
- `toCsv()` — comma, quote, newline, empty cell, and formula-injection (`=`,`+`,`-`,`@`) cases.
- export endpoint — org isolation (user A cannot see org B rows), filter fidelity, 10k cap + note row,
  and attachment filename header.

## Smoke / manual (user-visible behavior)
| Scenario | Expectation | Result |
|---|---|---|
| Click Export with filters active | CSV downloads with exactly the filtered rows | PASS |
| Open CSV in a spreadsheet | Columns match the table order; no formula executes | PASS |
| Export >10k matching rows | File capped at 10k + final note row; toast shown | PASS |

## Producer + consumer
- Filter contract and column order shared from one definition; list and export verified consistent.

## Verdict
- **Primary signal status:** met — filtered, permitted CSV downloads correctly.
- **Secondary signal status:** all green (tests/typecheck/lint/build).
- V-ID freshness: V-05-01..04 rerun after the last implementation change.
- Blockers: none.
