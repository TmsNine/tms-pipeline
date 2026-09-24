# Example: the ACME "Order activity" screen

This example shows how `tms-ui-screen` takes an existing admin section of a fictional product, ACME, from selection to a production handoff. It illustrates the order of operations; it is not a task to repeat.

## Incoming request

```text
Use $tms-ui-screen for the next screen.
"Invoices" was accepted last. Move on to "Order activity", map the related backend and show a live QA before final acceptance.
```

## UI-00 — Scope

The skill finds the `admin-order-activity` row in the accepted-screen register and records:

- mode: `redesign`, because the task-first hierarchy changes, not only the skin;
- role: admin/manager;
- surface package: activity list, "Now/History" modes, filters, period calendar and activity details;
- out of scope: changing the operations themselves, a generic audit log, new destructive actions;
- approved peers: "Invoices" and the closest accepted admin screen;
- visual: `pending`;
- integration: after reading the code, `real_route_real_api` or an honest weaker status;
- release: `worktree`.

The skill does not start redesigning the dashboard, team or invoices screens in parallel.

## UI-01 — Product and backend map

The skill walks the real vertical `AdminApp -> OrderActivityScreen -> admin API -> activity projection/service -> shared schema` and establishes:

- the list covers a fixed set of state-changing order operations, not every click;
- admins first need to see what is unfinished and needs attention;
- closed, cancelled and reversed operations belong to history;
- details are read-only;
- the period is computed in the account's timezone;
- display names must survive the shared-schema parse and never degrade into raw IDs.

The skill classifies the shared-contract and timezone gaps as `missing_contract`; it does not invent local names and does not widen the pass into a backend migration.

## UI-02 — Contract

The skill records a task-first contract:

1. Header with safe area, a section chip and the real menu button.
2. A "needs attention now" summary styled like the accepted Invoices surface.
3. Two modes: active work and history.
4. Secondary type/source/period filters inside a compact filter surface.
5. A compact activity card without duplicated data.
6. Short details in a centred modal; tall filtering in a mobile sheet.
7. Loading does not change the title's meaning and does not flicker.

If the owner does not change meaning or navigation, the skill may build the first slice right away. If someone proposes turning the list into a general audit log, the skill must stop and ask for a decision.

## UI-03 — First interactive slice

The skill uses the real `AdminApp` and `OrderActivityScreen`, not a separate HTML copy, and serves a stable QA route such as:

```text
http://127.0.0.1:5191/?screen=admin-order-activity
```

The first slice contains:

- entry from the admin menu;
- a populated list with two operation types;
- the "Now/History" modes;
- one detail modal;
- exit back to the menu.

The owner gets exact instructions: open the screen, switch mode, open filters, choose a period, open a refund and a reassignment detail, return to the menu.

## UI-04 — Full implementation

Once the direction is approved, the skill completes:

- every operation type and status;
- loading, empty, partial error, retry and pagination;
- a viewport-bounded filter sheet;
- a calendar layered over the sheet inside the phone frame;
- a selected filter without a redundant checkmark;
- details that do not repeat the amount or item count;
- accessible names, focus, Escape and scroll lock;
- the shared task-summary primitive instead of a local copy of the Invoices styles.

Backend gaps stay honestly recorded and are not masked with demo fields presented as production truth.

## UI-05 — Self-QA

The skill checks 360x640 and 430x932:

1. Enter through the admin menu.
2. Confirm loading does not change the title.
3. Switch "Now/History".
4. Open filters and confirm the sheet stays within the viewport.
5. Open the calendar; check placement and Escape.
6. Choose a filter: highlight only, no checkmark.
7. Open refund details: the amount appears once.
8. Open bulk reassignment details: the count appears once, the affected orders as a separate list.
9. Check the exit to the menu and the absence of console errors.
10. Run targeted tests, typecheck, build and a diff check.

The status becomes `fixed`, not `accepted`.

## UI-06 — Independent review

A fresh reviewer receives the raw diff, screen record, the Invoices reference and the QA route. It checks task-first meaning, visual parity, viewport overlays, states, accessibility, component ownership and data honesty.

A PASS is valid only for the unchanged current state. After remediation the skill repeats self-QA and runs a new review.

## UI-07 — Owner acceptance

The owner opens the same stable route and explicitly approves the screens. Only then does the skill:

- set `visual_status = accepted`;
- keep the narrow/wide screenshots and decisions;
- freeze the Invoices-derived shape;
- state separately that QA uses real components but may run on demo data;
- avoid calling the screen deployed while it lives only in a worktree.

## UI-08 — Production handoff

The skill re-checks the real wiring. If the component is already mounted in `AdminApp`, it does not create a second frontend ticket. It creates or extends one vertical parity bundle, here `ACME-142`, covering:

- the backend read model for the order operations;
- shared schema fields with display names;
- a timezone-safe period;
- account-scoped privacy and tenant boundaries;
- real API parity on the production route;
- narrow/wide QA without visual drift;
- launch/manual gates where needed.

Further work on `ACME-142` runs through the regular TMS stages. `tms-ui-screen` stops here.

## What the final answer looks like

```text
Result: admins see unfinished operations first and can open clear read-only details without duplication.
Surface: Order activity — list, filters, period calendar, details.
Visual: accepted.
Integration: real route; QA data type stated separately.
Release: worktree, not deployed.
QA: stable route; 360x640 and 430x932; entry/exit, filters, calendar and details checked.
Validation: targeted tests, typecheck, build, browser QA, fresh reviewer PASS.
Accepted baseline: narrow/wide screenshots and the current screen record.
Production path: ACME-142.
Remaining gates: backend/shared-contract parity and release path.
Captured follow-ups: ACME-142.
```
