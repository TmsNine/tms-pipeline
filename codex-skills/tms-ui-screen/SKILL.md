---
name: tms-ui-screen
description: Take one screen or a coherent frontend section through a managed cycle from product meaning and a backend map to interactive QA, independent review, the owner's visual approval and a production handoff. Use when the user asks to build the next screen, rework or polish UI, assemble a frontend concept, continue a screen-by-screen pass, or bring a section in line with the design system without chaotic scope growth.
---

# TMS UI Screen

## Purpose

Drive one user-facing surface through a short interactive frontend pipeline. Keep visual approval, real wiring and production release separate. Hand a missing backend over to the regular TMS pipeline; do not hide it inside a UI pass.

A change to an app screen or admin screen runs through this skill, not through `tms-04-implement`. This skill does not replace the classic `00_ticket -> 06_review_gate` pipeline for production backend or contract work. Use it for the visual contract and implementation of the current frontend surface; after acceptance, open one vertical parity ticket if one is actually needed.

## Read first

1. Read the nearest `AGENTS.md` in full, plus any more deeply nested instructions.
2. Read the active task's previous artifact and the surface's current code.
3. Find the accepted-screen register or other register of visual surfaces (`AGENTS.md` → *UI And Design*). Read it from the main branch, not the task branch.
4. Read the current design system (`AGENTS.md` → *UI And Design*) and the two closest accepted screens of the same role and viewport.
5. Check the working tree and make sure it does not hold a second unfinished frontend implementation with an unclear owner.
6. When creating or updating a screen entry, read [references/screen-record.md](references/screen-record.md).
7. For an example of a full pass, read [references/operations-example.md](references/operations-example.md).

Do not create a separate summary document if the project already keeps decisions in the screen register or the task artifact. Update the existing source of truth.

## Accepted screens are the reference

Screens the owner has accepted are the baseline. Match new work to them; do not redesign an accepted screen in passing during another task. A change to an accepted screen is its own scoped pass through this skill and ends with a new owner acceptance.

## Define the unit of work

Treat a surface package as one product menu item plus every state its main job directly needs:

- the top-level route and shell;
- the main list or working surface;
- the required detail or action surface;
- loading, empty, error/retry, populated, disabled/in-progress and success/resolved;
- entry and exit.

Do not include neighbouring screens just because they are visible from the current shell. For a shell task, check child screens for compatibility, but do not redesign them without a separate scope.

Classify adjacent findings:

- `blocking_current_surface` — fix now;
- `shared_primitive` — fix in the owning component and re-check the affected surfaces;
- `backend_or_product_gap` — record for one vertical follow-up;
- `adjacent_surface` — note in the register; do not widen the current implementation.

## Choose a mode

Choose one mode and record it in the screen record.

### `polish`

Use when the user meaning, route and backend contract are already settled and the work concerns visual language, layout, states or accessibility. UI-02 and UI-03 may be merged, and no intermediate owner gate is needed if there is no product decision to make.

### `redesign`

Use when the hierarchy, navigation, main action, section composition or the way the job gets done changes. An explicit owner decision on the text contract or on the first interactive slice is required before full implementation.

### `concept`

Use when the owner wants to define the frontend first and the backend is incomplete. Work in the real shell and production components with agreed demo data. Do not implement migrations, APIs or temporary production fallbacks inside a concept pass. After visual acceptance, handle production parity separately.

## UI-00 — Fix the scope

1. Pick the next register row by priority or by the owner's explicit instruction.
2. Record the role, route, QA route, surface package, included sub-screens and explicit exclusions.
3. Check that one worktree does not contain two parallel unfinished implementations. Use a separate worktree for parallel work.
4. Record four independent statuses:
   - `visual_status`;
   - `integration_status`;
   - `release_status`;
   - `gap_status`.

Do not start coding while the scope is unclear.

## UI-01 — Build the product and backend map

Trace the vertical:

`entry -> route/guard -> shell/page -> handler/client -> API/schema -> service -> DB/external effect`

Check horizontal neighbours: matching routes, serializers, read/write paths, roles, tenant scope, loading/error/retry, tests and docs.

For every action, answer:

- why the user needs it;
- where it is launched from;
- what data and permissions it needs;
- what real side effect happens;
- what counts as success;
- what is shown on error;
- whether it can be repeated, undone or found again later.

Classify backend capabilities as `primary`, `secondary`, `disclosure`, `hidden_technical`, `out_of_scope` or `missing_contract`. Do not surface every function found on the main screen.

If meaning, money, permissions, a destructive action or a lifecycle is undefined, stop implementation. Give the owner concrete options framed through a real user scenario, a recommendation, and the expected outcome of each option.

## UI-02 — Fix the screen contract

Record a minimal contract:

- the user's job;
- entry and exit paths;
- the main action;
- the hierarchy `urgent now -> working list -> history/settings`;
- what is visible at once and what is hidden in a disclosure or detail;
- the full set of visible states;
- modal / sheet / popover decisions;
- product copy;
- the two closest accepted peer screens;
- owner decisions that cannot be reopened without a new question.

For a complex flow, show the full text wireflow first. For a new tour, get the step list and copy approved first. For merging scenarios, get the single user route approved first.

In `redesign` and `concept`, do not move to full implementation without an owner decision. Continue without a pause only when the decision already follows explicitly from the current sources of truth.

## UI-03 — Build the first interactive slice

Build a minimal vertical slice:

- the real app shell;
- the real entry path;
- the populated state;
- the main composition;
- the main action;
- the real exit path.

Use production components. Agreed demo APIs or data are allowed, but label the QA type explicitly:

- `prototype`;
- `real_component_demo_data`;
- `real_route_real_api`.

Do not use a static image as the interface, a separate HTML imitation when real components exist, or an invented shell. Do not call QA production.

In `redesign` and `concept`, give the owner a stable URL, the exact click path, what is being accepted now and what is not implemented yet. After feedback, update the decision log and return to UI-02/UI-03. Once the direction is approved, set `visual_status = concept_approved`.

## UI-04 — Complete the surface

1. Implement every required state and child action of the surface package.
2. Reuse existing tokens, primitives and accepted controls before creating anything new; a gap in a shared primitive is fixed in the primitive's owner, not copied locally.
3. Keep the visual skin inside components; leave the screen/page layer for composition and data.
4. Do not show raw backend codes, provider copy or internal explanations.
5. Check long copy in the product's language(s) and the consistency of demo data.
6. Do not mask a missing upstream contract with a local success or duplicated business logic.
7. Do not widen a concept pass into backend, migrations or external setup.

If a gap does not block the visual contract, keep an honest state and continue. If the interface cannot be understood without a decision, return to UI-01/UI-02.

## UI-05 — Run self-QA

Check the real route, not only the isolated component.

Required matrix:

- the current screen and the two accepted references at the same viewport;
- the project's narrow and wide sizes (for a mobile web app, at least 360x640 and 430x932);
- 320 px when overflow is a risk;
- entry, exit and the main action;
- loading, empty, error/retry, populated, disabled/in-progress, success/resolved;
- modal, sheet, calendar, select, combobox and dropdown in their open state;
- safe area, long copy, focus, Escape, outside click, scroll lock;
- no clipping, no horizontal scroll and no console errors;
- accessible names, `aria-expanded`/`aria-controls`, touch targets of at least 44 px.

Run narrow meaningful tests, typecheck, build and a repository diff check, or the project's task check (`AGENTS.md` → *Testing And Validation*). A change to a shared contract is checked on both producer and consumer.

Before claiming a browser result, confirm separately that:

- the server responds;
- the URL matches the surface record;
- the browser panel is actually visible;
- the route is rendered, not merely opened in a hidden session;
- the stand's data type is stated honestly.

After self-QA, set `visual_status = fixed`, but not `accepted`.

## UI-06 — Run an independent review

Launch a fresh independent reviewer after self-QA is complete. Do not pass it the expected answer or your own diagnosis. Pass the raw scope, diff, screen record, QA route and accepted references.

Check seven axes:

1. clarity of the user's job;
2. visual compatibility with accepted peers;
3. real route, entry/exit and main action;
4. completeness of states and copy;
5. viewport, overlays and host-platform chrome;
6. accessibility;
7. component ownership and honesty of the backend/data status.

Count a PASS only with no P1/P2 findings, the required matrix passed, and a final score of at least 9/10. The score alone never replaces evidence.

After any edit, treat the previous review as stale and run a fresh check of the current state. If one class of finding repeats twice, stop patching locally: return to UI-02 or to the owning shared component.

The reviewer may not set `accepted`.

## UI-07 — Get the owner's visual acceptance

Give the owner:

- a stable QA URL;
- the `integration_status` and data source;
- the exact entry path;
- a concrete click order;
- what the acceptance covers;
- which neighbouring surfaces it does not cover;
- remaining backend or manual gates.

Set `visual_status = accepted` only after the owner's explicit decision. Keep the accepted screenshots, QA route, decision log and an exact acceptance snapshot or repository fingerprint if the project provides a canonical helper. Record the screen in the accepted-screen register (`AGENTS.md` → *UI And Design*).

Freeze the visual form. Any later visual change returns the surface to `fixed` and requires a new manual acceptance.

## UI-08 — Hand over to the production path

After visual acceptance, check `integration_status` and `release_status`.

- If the real route and real API are already wired, do not create a dummy frontend ticket; hand the surface to the regular release path.
- If backend, shared-contract, real-data or auth gaps remain, find the existing bundle in the backlog (`AGENTS.md` → *Documentation Base*) and extend it, or create one vertical production-parity ticket.
- Include in the parity scope the producer, the shared contract, frontend wiring, tenant/privacy boundaries, tests, the live route and launch/manual gates (the launch playbook, `AGENTS.md` → *Pre-Launch Manual Action Capture*).
- Reference the accepted visual baseline and forbid visual drift without a new owner decision.
- Use the appropriate TMS stage skill (`tms-00-ticket`, then the pipeline under `tms-run`) for registration and further implementation. Do not start the next engineering stages automatically.

Do not split one surface into unrelated frontend and backend tickets. Do not leave a follow-up only in chat.

## Statuses

Use independent axes:

- `visual_status`: `pending | concept_approved | fixed | accepted`;
- `integration_status`: `prototype | real_component_demo_data | real_route_real_api`;
- `release_status`: `worktree | committed | deployed`;
- `gap_status`: `none | <ticket ids> | manual_gate`.

Never say "done" or "live in the app" without these four qualifiers.

## Intermediate handoff to the owner

Write handoffs in the project's output language (`AGENTS.md` → *Operating Standard*); translate the field names below if it is not English.

```text
First interactive slice: <what already works>
QA: <url> — <integration_status>
How to check: <path and 3-7 concrete actions>
Being accepted now: <composition / route / main action>
Not included yet: <states / backend / neighbouring screens>
Decision needed: <only if one is really needed>
```

## Final format

Use every field:

```text
Result: <user-visible effect>
Surface: <name and scope>
Visual: <visual_status>
Integration: <integration_status>
Release: <release_status>
QA: <url, viewports, main user-visible signal>
Validation: <tests/typecheck/build/browser/reviewer>
Accepted baseline: <screenshots/fingerprint or not applicable>
Production path: <none/release/ticket id>
Remaining gates: <manual/backend/deploy or none>
Captured follow-ups: <ids or none>
```

Do not commit, stage, push or deploy without explicit permission or the project's own closing-stage contract.
