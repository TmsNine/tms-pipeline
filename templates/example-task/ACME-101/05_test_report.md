# Test Report: Export reports list to CSV

Date: 2026-01-15

## Automated checks
| Type | Command | Result |
|---|---|---|
| Targeted tests | `npm test -- csv reports-export` | PASS (12 tests) |
| Typecheck | `npm run typecheck` | PASS |
| Lint | `npm run lint` | PASS |
| Build | `npm run build` | PASS |

Coverage of note:
- `toCsv()` — comma, quote, newline, empty cell, and formula-injection (`=`,`+`,`-`,`@`) cases.
- export endpoint — org isolation (user A cannot see org B rows), filter fidelity, 10k cap + note row.

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
- Blockers: none.
