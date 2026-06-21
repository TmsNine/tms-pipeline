---
name: tms-audit-triage
description: "Codebase-audit stage 3 — consolidate all per-zone findings: dedup across zones, classify consistently into Class A/B/C/D, run a completeness critic, and propose bundled tickets (bundle-don't-shard). Writes 01_triage.md then STOPS for user review. Third of the tms-audit-* pipeline. Use when the user invokes /tms-audit-triage after the zone sweeps are done."
argument-hint: "[AUDIT-folder]"
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

Turn the scattered per-zone findings into one clean, deduped, classified list with proposed bundles — the artifact the user reviews before anything touches the backlog.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for: the severity rubric (Class A/B/C/D) and what's a real blocker vs polish, the backlog location, the bundle-don't-shard / consolidation rules and grouping criteria, where gap-audit/audit-sourced Class C bundles must land, and the output language.

## Method

1. **Load the audit.** Find the active `docs/AUDIT-*/` folder (latest, or `$1`). Read `manifest.md`. If any zone is still `☐ pending`, warn the user and list which — you may proceed but the triage is partial; note the gap explicitly.

2. **Gather.** Read every `areas/*.md`. Pull all **confirmed** findings (ignore the rejected/false-positive lists — they were already killed in sweep).

3. **Dedup across zones.** The same root cause often surfaces in multiple files/zones. Merge those into one finding that lists all locations. Prefer fixing the owning layer once over N symptom rows.

4. **Classify consistently.** Re-apply the project's Class A/B/C/D rubric across the whole set so severity is comparable between zones, carrying each finding's "why this class, not the one below" rationale (revise it where cross-zone context changes the call). No inflation — Class A means "data loss / security breach / PII leak / blocks launch", not "could be nicer". Most audit findings are C (polish) or D (theoretical). Within each class, **rank by the confidence score** from sweep so the highest-confidence items lead.

5. **Completeness critic.** Spawn one critic subagent (`Agent`, `general-purpose`, `model: opus`, fresh context): given the zone list and the consolidated findings, ask "which zones or categories look thin, what was likely missed?" Record its answer as completeness notes; if it flags a zone as under-covered, recommend re-running `tms-audit-sweep` on that zone rather than papering over the gap.

6. **Propose bundles (bundle-don't-shard).** Group findings into bundled tickets per the project's grouping criteria (same surface / review domain / driver / escort profile; 2–7 sub-items each). Before inventing a bundle, check existing open backlog bundles to fold into. Do NOT bundle across priorities or unrelated epics. Treat real **Class A/B blockers separately** — they are urgent standalone items, not buried inside a Could-priority polish bundle. Each proposed bundle gets a draft ID, driver line, sub-item composition (with `file:line`), and suggested priority (Class C polish → default `Could`).

7. **Write `01_triage.md`:** counts by Class; the deduped full finding list (each with its confidence and class rationale, ranked by confidence within class); Class A/B blockers highlighted at the top with their empirical evidence; the proposed bundles (draft ID, driver, composition, priority, "fold into existing <TICKET-ID>?" notes); completeness notes and any recommended re-sweeps.

## Closing

**STOP for user review.** Do not write anything to the backlog or create ticket folders in this stage. Report (project's output language): totals by Class, the headline blockers, the proposed bundles, and that the next step — after they approve/edit the bundles — is `tms-audit-backlog`.
