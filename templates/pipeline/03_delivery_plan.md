# Delivery Plan: [TASK_NAME]

Date: [DATE]

## Inputs
- `02_design.md` (approved), `02b_gap_audit.md`

## Waves
Each wave is the smallest coherent unit that can be implemented and proven on its own.
Tag each wave with its risk profile:
M = mono/bounded · E = evidence-assisted · R = risk review required · C = maximum risk.
State what 04b must stress-test for that wave.

### Wave 1 — [name]  ·  Profile: [M/E/R/C] — [trigger reason]
- Scope: ...
- Files: ...
- Acceptance: ...
- 04b review depth: ...
- Owning R-IDs: [R-... / none]

### Wave 2 — [name]  ·  Profile: [M/E/R/C] — [trigger reason]
- Scope: ...
- Files: ...
- Acceptance: ...
- 04b review depth: ...
- Owning R-IDs: [R-... / none]

## Canonical risk ledger
Keep this ledger append-only. Later stages may add `X-*` risks but must not rewrite an existing R-ID.
Profile M/E may have none or 1–3 entries; Profile R/C normally has 3–7.

| R-ID | Business invariant | Trigger / surface | Owner layer | Required proof | Failure signal | Owning wave | Search map |
|---|---|---|---|---|---|---|---|
| R-... | ... | ... | ... | ... | ... | Wave ... | ... |

## Risks & mitigations
- Risk: ...
  - Mitigation: ...

## Rollout / ordering
- [migration before/after deploy step, feature flag, etc.]
