# <TASK-ID> — 02 Design

Date: <YYYY-MM-DD>
Base SHA: <sha>
Status: DRAFT | NEEDS_OWNER_DECISION | APPROVED

## Inputs

The ticket, the research, the exact documents and precedents the decision
stands on.

## Owning sources and boundaries

Owning layer: where we fix and why exactly there.
Boundaries: what the task does not touch, even if it is next door.

## Owner's decision

Each interview question as a line: `question → owner's answer → consequence`.
No interview was needed — say so.

## Solution

What we do, in substance. If options were considered — which one was chosen and
why the others were rejected. One paragraph is enough when the answer is obvious.

## Acceptance contract

Observable behaviour as rows. Format: before → after, as the user sees it.

| ID | Who | Before | After |
|---|---|---|---|

## Design by layer

Only the touched layers. "Unchanged" is a complete answer.

### API contract
### Route and permissions
### Service
### Persistence and migrations
### External effects (messaging, payments, queues)
### UI

## TDD matrix

| Behaviour | Test | Level | What it proves |
|---|---|---|---|

## Rollout and rollback

Rollout order, migration number, how we roll back, the sign of failure.

## Resolved questions

Every open question from research — with its answer. None left open.
