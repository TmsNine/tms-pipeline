# Test Report: [TASK_NAME]

Date: [DATE]

## Freshness
- 04b normalized status: PASS / non-PASS
- Implementation fingerprint: [current] / [accepted 04b] — match yes/no
- Package fingerprint (normalized evidence fields): ...
- Fingerprint helper: `tms-task-fingerprint-v1`; source: `worktree`; manifests match stage 04: yes/no

## Automated checks (cheapest meaningful first)
| V-ID | Type | Command | Implementation fingerprint | Result | Covers |
|---|---|---|---|---|---|
| V-05-... | Targeted tests | `...` | ... | PASS/FAIL | AC/R/X |
| V-05-... | Typecheck | `...` | ... | PASS/FAIL | ... |
| V-05-... | Lint | `...` | ... | PASS/FAIL | ... |
| V-05-... | Build | `...` | ... | PASS/FAIL | ... |

## Smoke / manual (user-visible behavior)
| Scenario | Expectation | Result |
|---|---|---|
| ... | ... | ... |

## Producer + consumer (if contracts changed)
- ...

## Verdict
- **Primary signal status:** met / not met / partially validated
- **Secondary signal status:** [exact checks run and what they showed]
- V-ID freshness: ...
- Blockers: ...
