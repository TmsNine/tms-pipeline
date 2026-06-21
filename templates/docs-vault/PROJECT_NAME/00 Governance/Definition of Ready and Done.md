# Definition of Ready and Done

> Write the CONTENT in your project's output language. Tailor every item below to your project — these are starting defaults, not law.

## Definition of Ready

A task may enter the pipeline only when all of the following hold. Edit freely.

- [ ] **Scenario / flow defined** — the user or operational flow this task serves is described (see `02 Product/Flow - <FLOW_NAME>.md`).
- [ ] **Scope in PRD** — the work is covered by a Product Requirements Document; if not, the PRD is updated first.
- [ ] **API / data clarity** — the contracts, data shapes, and persistence touched are known (or explicitly flagged as open).
- [ ] **Acceptance criteria written** — 3-5 observable pass/fail criteria exist, with a primary user-visible signal.
- [ ] **Risks identified** — security, privacy, data-integrity, concurrency, and rollout risks are noted or ruled out.

## Definition of Done

A task is done only when all of the following hold. Edit freely.

- [ ] **Implementation matches flow / PRD** — behavior follows the agreed flow and requirements, no silent drift.
- [ ] **Critical business logic tested** — the high-value paths have automated tests (or a stated, justified manual signal).
- [ ] **No critical / high bugs** — no known blockers or high-severity defects remain open.
- [ ] **Docs updated** — durable knowledge in this vault (PRD / Flow / Architecture / Traceability / Backlog) reflects the change.
- [ ] **Review gate passed** — the review stage returned `go` or `conditional_go` (a `conditional_go` records its open conditions).

> Note: tailor both checklists to your project — add domain-specific gates (e.g. compliance, accessibility, performance) and remove what doesn't apply.
