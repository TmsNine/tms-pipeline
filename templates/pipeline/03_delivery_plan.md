# Delivery Plan: [TASK_NAME]

Date: [DATE]

## Inputs
- `02_design.md` (approved), `02b_gap_audit.md`

## Waves
Each wave is the smallest coherent unit that can be implemented and proven on its own.
Tag each wave with its risk profile:
M = mono/bounded · E = evidence-assisted · R = separated proving roles · C = full proving-role separation.
State code ownership, proving roles, scope-drift baseline, stage-04 readiness and what 04b must stress-test.

### Wave 1 — [name]  ·  Profile: [M/E/R/C] — [trigger reason]
- Scope: ...
- Expected files / owner layers: ...
- Code owner / proving roles: ...
- Acceptance: ...
- Stage-04 readiness gate: [validation + R/X evidence + no A/B/systemic C + fresh Reviewer >= 8.0 for R/C]
- Scope-drift trigger: [new trust boundary/owner/profile trigger or >25% unexplained path growth]
- 04b review depth: ...
- Owning R-IDs: [R-... / none]

### Wave 2 — [name]  ·  Profile: [M/E/R/C] — [trigger reason]
- Scope: ...
- Expected files / owner layers: ...
- Code owner / proving roles: ...
- Acceptance: ...
- Stage-04 readiness gate: ...
- Scope-drift trigger: ...
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

## Final pre-04b integration gate
- Required for R/C: [fresh Reviewer, exact fingerprint, score, findings, R/X status]
- Profile C cross-wave adversarial review: [required/result]
