# <TASK-ID> — 03 Plan

Date: <YYYY-MM-DD>
Design: docs/<TASK-ID>/02_design.md
Base SHA: <sha of the main branch at approval>
Status: DRAFT | APPROVED
Signed by the lead: <date>

## Plan

| Phase | What we do | How we prove it |
|---|---|---|

## Normative contracts

Verbatim what the implementation must satisfy: schema with columns, types,
nullability and defaults; FKs and delete rules; check/unique/index predicates;
interface signatures and contracts. Not a link to the design — the text itself.

If a phase needs none of this — say so.

## Execution order

The order of phases and why exactly this one. What depends on what.

## File Ownership

The complete list. Anything not in this table is not written in stage 04.

| File | Phase | Create / change | Why |
|---|---|---|---|

## Data flow

How data moves through the changed layers. One diagram or a few lines.

## Seams

Every hop of the "Vertical" in `01_research.md`: do we change it or leave it as
is, and which phase owns it. A hop that belongs to no phase is a defect of the
plan, not an empty cell.

| Hop | What is handed on | Change / unchanged | Owning phase |
|---|---|---|---|

## Risks and mitigations

| Risk | Mitigation | Sign that it happened |
|---|---|---|

## Validation strategy

Every check is a table row, and every row runs as-is. Not "check that the API
builds" but a command you can paste into a terminal. No prose in this section.

| # | Phase | What it proves | Command | Run from directory | Green = |
|---|---|---|---|---|---|

Row rules:

- **The command pastes and works.** No "etc.", no placeholders, no "same for
  the other packages". Each package gets its own row.
- **The directory and environment variables are part of the check, not
  background.** Many suites give a different answer depending on where they
  are started from or which environment they see (a time zone, a workspace
  flag, a working directory). A row without its directory is unfinished.
- **"Green" is exit code 0 plus the named marker in the output.** A wrapper
  that prints "success" regardless of its exit code is not evidence.

Two rows are mandatory; their absence is a defect of the plan:

1. **Build and type-check of every touched package** — one row per package.
   Test runners often transpile without type-checking, so a green live run
   cannot see this class of defect by construction, while the production build
   calls the real compiler and the rollout breaks. If the project has a single
   task-check command (`AGENTS.md` → *Testing And Validation*), this row is
   that command: one command covers every touched package and none can be
   forgotten.
2. **One check that crosses every seam in the table above with no mock between
   them.** If it cannot be built, say why and put another row with a command in
   its place. "Covered by unit tests on both sides of the seam" is not a
   substitute: a suite where each side mocks its neighbour turns green whether
   or not the product works.

### Manual scenario

The steps a person goes through by hand, and what must happen. Separate from
the table: it has no exit code, and it is the only part of the check that
legitimately has none.

## Fresh-reader check

Who read it, what was compared, what was found. "No inconsistencies" is a valid
result.

## Proof of executability

| Phase | File and test | Setup → action → assertion | Command | Why it will be red |
|---|---|---|---|---|

The only allowed expected RED reason is that the product code does not exist
yet. Any other reason means a hole or a contradiction, and it is fixed here. The
test file is created only in stage 04 after the plan is signed.
