# Documentation System and Handoff Guide

> Write the CONTENT in your project's output language. The structure below is a skeleton — adapt the hierarchy to your project.

## Source-of-truth hierarchy

Each layer feeds the next. When two docs disagree, the higher (more upstream) layer wins for *intent*; current code wins for *implementation detail*.

1. **Discovery** — raw problem framing, interviews, constraints. Why this project exists.
2. **PRD** (`02 Product/PRD - <FEATURE_AREA>.md`) — what to build, for whom, with what acceptance.
3. **Flow** (`02 Product/Flow - <FLOW_NAME>.md`) — step-by-step user/operational behavior and states.
4. **Architecture** (`03 Architecture/Architecture Delta.md`) — how it's built; decisions and trade-offs.
5. **Traceability** (`04 Delivery/Traceability Map.md`) — links each backlog item back to PRD / Flow / Architecture.
6. **Backlog** (`04 Delivery/Backlog.md`) — the single source of truth for tasks; an index, not storage.

## Current-state vs target-state

Keep these distinct in every doc:

- **Current state** — what exists and behaves today. The baseline a new task changes.
- **Target state** — what the task or epic intends to reach. Mark clearly so readers never mistake a plan for reality.

When a target state ships, fold it into current state and remove the now-stale "target" framing.

## Recommended reading order (someone new to the project)

1. This guide.
2. `00 Governance/Definition of Ready and Done.md`.
3. The relevant `02 Product/PRD - <FEATURE_AREA>.md`.
4. The relevant `02 Product/Flow - <FLOW_NAME>.md`.
5. `03 Architecture/Architecture Delta.md`.
6. `04 Delivery/Traceability Map.md`, then `04 Delivery/Backlog.md`.

> Note: replace the placeholder layer names with your project's actual document set; drop layers you don't use.
