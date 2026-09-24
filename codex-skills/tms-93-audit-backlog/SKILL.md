---
name: tms-93-audit-backlog
description: "Codebase-audit stage 4 — revalidate the approved triage against current canonical state, then map every approved debt finding exactly once into an existing bundle, a new current-format task, an accepted disposition, or the owning launch/control-plane document. Writes 02_backlog.md. Final stage of the tms-9x-audit-* pipeline. Use when the user invokes tms-93-audit-backlog after approving 01_triage.md."
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# Codebase Audit — Stage 4: Backlog

Commit the approved triage into durable work items. This is the only audit stage
that edits the backlog, task contracts, or launch/control-plane documents — so
it runs only AFTER the user has reviewed and approved `01_triage.md`. It
faithfully registers that mapping; it does not silently re-triage or reopen
refuted claims.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for: the backlog location and row
format (the row is an index, not storage), current task-registration contract,
Future Work Capture rules, bundle-don't-shard/consolidation and ID-numbering
rules, closed/archive/latest-gate reconciliation, manual-action ownership and
launch-playbook paths, source-of-truth precedence, and the output language.
Current project instructions override historical ticket files found in the
repository.

## Method

1. **Precondition.** Resolve the exact audit from `$1`, a named `audit_id`, or
   unambiguous current context; if multiple audits are plausible, stop rather
   than choosing the latest directory. `01_triage.md` exists and the user
   approved its exact bundles and dispositions after Stage 92 reported the
   file's SHA-256. Recompute it and require an exact
   `approved_triage_fingerprint` match; generic advance approval or any later
   edit is insufficient. If either
   `snapshot_coverage` or `current_debt_coverage` is `PARTIAL`, the user must
   also have explicitly accepted the named exclusions; otherwise stop. That
   approval authorizes routing only the validated survivors and never turns
   partial discovery into audit closure.

2. **Revalidate, don't register stale evidence.** Compare the audit
   `target_sha`, the triage's canonical validation SHA, current canonical HEAD,
   changed paths, and active worktrees. Any canonical change after the approved
   triage is a new delta coverage gap, even when it does not invalidate an
   already known finding: stop before mutation and return through delta Scope,
   the required Stage 91 sweeps, and Stage 92. Reconcile candidate IDs across
   the open backlog, closed archive, existing task folders, and latest gates.
   Do not add new scope to a closed task or infer that an old ID is reusable.
   Work from a clean isolated registration checkout/worktree at that canonical
   HEAD. If uncommitted user changes overlap any target document, stop instead
   of mixing or overwriting them. A `duplicate_closed` route also requires the
   closing commit to be an ancestor of current canonical HEAD.

3. **Map only approved dispositions.** Only approved `open_code` and
   `open_architecture` bundles enter implementation work. Route
   `code_complete_manual` to the owning launch/runbook document,
   `control_plane_drift` to the source selected by the project's declared
   precedence, and persist `accepted_risk` at an explicit durable decision/risk
   owner path. If ownership or precedence conflicts, stop that item and return
   it to triage. Preserve `duplicate_closed`, `resolved_stale`,
   `candidate_unproven`, and approved drops as recorded dispositions without
   creating tickets. A rejected claim cannot re-enter here without new
   evidence and a new triage approval. A code defect may also require later
   live proof; that manual action accompanies the code task and never
   substitutes for fixing the reproduced defect.

4. **Fold before creating.** For each approved implementation bundle, check
   existing open bundles for the same owner layer, reproducible driver,
   outcome, priority, and validation profile. If it fits, extend that current
   task contract and row using the project's absorption rules instead of
   adding a new row.

5. **Create only genuinely distinct current-format tasks.** A new task needs a
   distinct user-visible or operational outcome, a current reproducible driver,
   and independent priority. Create the folder/artifact prescribed by current
   project instructions and add exactly one short backlog-index row per bundle.
   Never assume a historical `00_ticket.md` convention. If the project defines
   no current format, default to `docs/TASK-XXX/spec.md` containing at least
   `Status: INTENT` and section `1. Task`. The task contract records the
   approved composition, `file:line` evidence, driver, owner/root cause,
   validation profile, and `Source: docs/AUDIT-<date>/`. Do not create
   ticket-per-finding output or child-task chains.

6. **Preserve true priority.** Real Class A/B findings retain their approved
   priority and are not buried inside lower-priority maintenance work. Do not
   change severity merely because evidence confidence is lower; stale or
   insufficient evidence returns to sweep/triage instead.

7. **Route manual actions.** Any approved pre-launch manual action surfaced by
   the audit (apply migration, run a smoke, set an env key, external config)
   goes to the launch/runbook document matching its stage, written so the
   designated operator can execute it: prerequisites, exact steps/SQL, expected
   result, and failure cue. Do not leave it only in `02_backlog.md`.

8. **Recheck and write `02_backlog.md`:** immediately before mutation, verify
   canonical HEAD still equals the approved triage's validation SHA, verify
   active-worktree overlaps and `approved_triage_fingerprint` again. Any change
   stops the stage and requires the new delta to be swept and triaged; do not
   merely revalidate known findings. Then record the audit target and
   registration HEAD, user approval, accepted exclusions, and exactly where every approved finding
   landed. Each finding maps once to an existing/new task path, launch/control-
   plane document, accepted risk, duplicate/closed item, candidate/unproven
   state, or approved drop. Include stale items returned for re-sweep and why.

## Closing

Report (project's output language) per the project's conversation contract:
audit target and registration HEAD; TASK-XXX IDs + paths created/updated;
launch/control-plane items updated (with migration numbers if any); accepted
non-ticket dispositions; stale items returned for re-sweep; and remaining
blockers. Never end with "recorded in 02_backlog.md" as the only signal — name
the concrete IDs and paths.
