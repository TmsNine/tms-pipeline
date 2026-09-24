---
name: tms-92-audit-triage
description: "Codebase-audit stage 3 — verify snapshot and seam coverage, consolidate confirmed technical and architectural debt across zones, revisit cross-zone-dependent rejections, dedup by owning root cause, classify consistently, and propose bundled work. Writes 01_triage.md then STOPS for user review. Third of the tms-9x-audit-* pipeline. Use when the user invokes tms-92-audit-triage after the zone sweeps are done."
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
  - TodoWrite
---

# Codebase Audit — Stage 3: Triage

Turn per-zone evidence into one snapshot-aware, cross-zone, deduped debt ledger
with proposed bundles — the artifact the user reviews before anything touches
the backlog.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for the backlog location,
bundle-don't-shard/consolidation rules, task/launch ownership, and output
language. Consume the exact canonical Class A/B/C/D rubric from `00_scope.md`;
if it is missing or conflicts with the project-owned rubric recorded by the
Scope stage, the audit is `PARTIAL` until Scope is corrected.

## Subagent Authorization (Codex)

A user invocation of this skill/stage is explicit authorization to use the subagents described by this skill. Do not treat the general multi-agent tool rule (spawn only on explicit user request) as a reason to skip a required reviewer, finder, skeptic, critic, worker, tester, architect, security specialist, or bounded explorer that this skill calls for. If this skill marks a subagent step as mandatory, run it; fall back to a local pass only when multi-agent tools are genuinely unavailable or the user explicitly opts out, and record the limitation in the stage artifact and final summary. If this skill marks a subagent step as optional, the invocation authorizes that option, but the skill's own use/skip criteria still decide whether it is worth running.

## Method

1. **Load and verify the audit envelope.** Find the active `docs/AUDIT-*/`
   folder named by `$1` or current context. If more than one audit is
   plausible, stop and request the exact `audit_id`; never choose by date or
   directory sorting alone. Read `00_scope.md`, `manifest.md`, and every zone's
   audited SHA/validator/re-sweep status. Resolve current canonical HEAD from
   the canonical checkout/worktree recorded in Scope; never substitute a dirty
   audit worktree's HEAD. Compare the recorded `target_sha` with current
   canonical HEAD and list changed paths since the snapshot.

   Record two axes: `snapshot_coverage: COMPLETE|PARTIAL` for the pinned
   `target_sha`, and `current_debt_coverage: COMPLETE|PARTIAL` for canonical
   HEAD. Snapshot coverage is partial when any zone is pending, was swept at a
   different SHA, lacks a required high-risk validator/independent adversarial
   review, or has an unresolved `↻ re-sweep required` status. Current debt
   coverage is partial
   whenever canonical changes after `target_sha` have not been swept through
   the affected owner/direct seams. List exact gaps. You may write a partial
   `01_triage.md`, but never describe it as complete current discovery or
   authorize backlog registration from it by default. A snapshot may therefore
   be complete for its pinned old SHA while current debt discovery remains
   partial until the canonical delta is swept.

   A missing `target_sha`, canonical checkout, zone `Audited SHA`, validator
   set, or declared required high-risk validator makes the affected coverage
   axis `PARTIAL`. Never infer these from timestamps, old task commits, or
   current HEAD.

2. **Gather.** Read every `areas/*.md`. Pull all confirmed findings. Also pull
   only false-positive entries marked `cross_zone_dependent`; revisit them when
   another zone, owner map, or current-head change invalidates the assumption
   that killed the local claim. Do not reopen ordinary independently refuted
   claims. A cross-zone rejection remains settled only when every owner, guard,
   consumer, schema constraint, worker, or external-effect path it relies on
   was audited at the compatible target; otherwise route it to re-sweep as a
   coverage gap, not an automatically confirmed finding.

3. **Dedup across zones and assign disposition.** Merge symptoms that share one
   canonical owner/root cause and list all affected seams/locations. Prefer one
   owning-layer fix over N consumer patches. Assign each survivor exactly one:
   `open_code`, `open_architecture`, `code_complete_manual`,
   `accepted_risk`, `control_plane_drift`, `duplicate_closed`, or
   `candidate_unproven`; current revalidation may additionally yield
   `resolved_stale`. `open_code` is a reachable violated behavior at an
   existing owner layer. `open_architecture` is an evidenced competing/missing
   owner or cross-boundary invariant that requires an ownership/contract
   change, not merely a local correction. Only reproduced/evidenced open code
   or architecture debt is eligible for implementation bundles; manual/live
   conditions, accepted risks, control-plane corrections, duplicates, and
   unproven candidates follow their owning project process. Reopen each surviving
   finding's cited path on current canonical HEAD and run the narrowest
   decisive validator/reproduction available; rerun Class A/B empirical
   evidence. A finding that no longer reproduces is `resolved_stale`, not
   backlog work. If current revalidation cannot be completed, record the
   limitation and do not present the claim as currently confirmed. Keep
   `duplicate_closed` only after proving that the cited closing commit is an
   ancestor of the audited and current canonical state.

4. **Classify consistently.** Re-apply the exact rubric copied into
   `00_scope.md` across the whole set so severity is comparable between zones,
   carrying each finding's "why this class, not the one below" rationale
   (revise it where cross-zone evidence changes the call). Severity expresses
   potential harm; confidence expresses evidence strength. Never lower
   severity solely because confidence is low: mark the claim
   `candidate_unproven`, drop it with the recorded sweep reason, or require a
   targeted re-sweep. Within each class, rank by confidence so the
   highest-confidence items lead.

5. **Completeness critic.** Spawn one fresh critic with the exposed
   clean-context mechanism (`fork_turns: "none"` in the current schema). Give
   it the audit envelope, zone owner/seam/risk/validator matrix, prior-audit
   coverage, confirmed findings, cross-zone-dependent rejections, exclusions,
   and manual/live unknowns — not just counts. Ask it to find:

   - uncovered owners, entrypoints, producers, consumers, stores, caches, or
     migration/generated/release seams;
   - missing cold lenses for canonical ownership, security/PII/money,
     lifecycle/queues, semantic duplication/cycles, false-green tests, and
     control-plane parity;
   - suspiciously thin zones or evidence that only proves a mock/build rather
     than the owning behavior;
   - mixed-SHA or active-worktree gaps that require a targeted re-sweep.

   Prefer Terra high for ordinary judgement, Sol high/xhigh for Class A/B
   security/privacy/payment/data-integrity, and Luna medium only for mechanical
   low-risk coverage. Never use Fast mode. Record preferred and actual/unknown
   runtime model. Re-sweep an under-covered zone; do not paper over the gap in
   prose. A critic hypothesis is a coverage lead, never a confirmed finding
   until a sweep supplies the normal evidence. When the critic demonstrates an
   uncovered owner, seam, required lens, or stale overlap, set the affected
   coverage axis to `PARTIAL` and add or restore a manifest row as
   `↻ re-sweep required`. The critic cannot leave a proven coverage gap behind
   a formally `COMPLETE` status.

6. **Propose bundles (bundle-don't-shard).** Group only `open_code` and
   `open_architecture` findings that share one owner layer, reproducible
   driver, outcome, priority, and validation profile. Bundle size follows that
   boundary; there is no finding-count quota. Before inventing a bundle, check
   existing open backlog bundles to fold into. Do NOT bundle across priorities
   or unrelated epics. Treat real Class A/B blockers separately. C/D debt
   defaults to fold-on-touch or an explicitly accepted constraint unless it has
   a distinct current driver. Each proposal gets a draft ID, driver,
   owner/root cause, affected seams and `file:line` composition, suggested
   priority, and "fold into existing TASK-XXX?" note. Never infer
   `accepted_risk` from finding age, a comment, owner silence, or approval of
   the triage itself; it requires an explicit owner decision and durable owner.

7. **Write `01_triage.md`:** `snapshot_coverage: COMPLETE|PARTIAL` and
   `current_debt_coverage: COMPLETE|PARTIAL`; audit target and current-head
   drift; zone/seam/validator coverage; counts by kind,
   disposition, and Class; deduped findings with confidence and rationale;
   Class A/B evidence; current revalidation; proposed bundles; manual/live
   routing; accepted risks; control-plane corrections; duplicates/dropped
   candidates; resolved/stale claims; reopened cross-zone rejections;
   completeness critic result; and required re-sweeps.

   After the file is final, compute its SHA-256 and report
   `triage_fingerprint` in the closing message. User approval must refer to
   that exact rendered triage; any subsequent edit requires a new fingerprint
   and approval.

## Closing

**STOP for user review.** Do not write anything to the backlog or create task
folders. Report audit completeness, audited/current SHA, uncovered seams or
re-sweeps, totals by kind/Class/disposition, headline blockers, and proposed
bundles. Recommend `tms-93-audit-backlog` only after the user approves the bundles
and, for either partial coverage axis, explicitly accepts the named exclusions.
Never call current debt discovery closed while `current_debt_coverage` is
`PARTIAL`.
