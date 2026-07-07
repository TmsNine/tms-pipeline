# Delivery Plan: [TASK_NAME]

Date: [DATE]

## Inputs
- `02_design.md` (approved), `02b_gap_audit.md`

## Waves
Each wave is the smallest coherent unit that can be implemented, tested, and committed on its own.
Tag each wave with its risk profile:
M = mono/bounded · E = evidence-assisted · R = risk review required · C = full classic allowed.
State what 04b must stress-test for that wave.

### Wave 1 — [name]  ·  Profile: [M/E/R/C] — [trigger reason]
- Scope: ...
- Files: ...
- Acceptance: ...
- 04b review depth: ...
- 04 risk-handoff seed:

| Invariant | Required proof/test | Owner layer | Failure signal | Risk search map |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### Wave 2 — [name]  ·  Profile: [M/E/R/C] — [trigger reason]
- Scope: ...
- Files: ...
- Acceptance: ...
- 04b review depth: ...
- 04 risk-handoff seed: [short prose is acceptable only for Profile M/E; use the table above for Profile R/C]

## Risks & mitigations
- Risk: ...
  - Mitigation: ...

## Rollout / ordering
- [migration before/after deploy step, feature flag, etc.]
