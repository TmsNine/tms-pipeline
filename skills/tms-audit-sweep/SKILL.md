---
name: tms-audit-sweep
description: "Codebase-audit stage 2 — sweep ONE immutable owner/seam zone for code defects, architecture debt, technical debt, false-green tests, and control-plane drift using a bounded fingerprinted code scout when ownership is unclear, followed by an adversarial finder↔skeptic duel. Record only findings that survive refutation. Run once per zone, each in a fresh context window; no arg = next pending zone from the manifest. Second of the tms-audit-* pipeline. Use when the user invokes /tms-audit-sweep."
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
  - TodoWrite
---

# Codebase Audit — Stage 2: Sweep (adversarial)

Audit exactly one zone at the manifest's immutable target SHA and write its
findings. Search both local code and the declared producer/consumer seams. The
whole point of this stage is the **finder↔skeptic duel**: an automated audit's
worst failure mode is false positives or local conclusions that miss an owning
layer elsewhere.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for the relevant source-of-truth,
owner, vertical-trace, coupled-path, validation, security, and output-language
rules, including the known-test-debt register (`AGENTS.md` → *Testing And
Validation*). Use the exact severity rubric persisted in
`00_scope.md`; do not reinterpret it per zone.

## Subagent Authorization (Claude Code)

A user invocation of this stage explicitly authorizes the subagents described by
the skill. Use Claude Code's `Agent` tool for mandatory scout, finder, skeptic
and critic work. Fall back to a local pass only when the Agent tool is genuinely
unavailable or the user explicitly opts out, and record the limitation in the
stage artifact and final summary. Optional delegation still follows the skill's
own use/skip criteria.

A local fallback is `adversarial_review: LIMITED`, not equivalent independent
coverage. It keeps a high-risk zone incomplete unless the user explicitly
accepts that named limitation.

## Subagent Independence And Model Tiers (Claude Code)

Every `Agent` call receives a fresh self-contained prompt. Use `Explore` for a
read-only scout and `general-purpose` for finder and skeptic. The skeptic must
NOT see the finder's reasoning as your endorsement, only bare claims to refute.

Model tiers:

- Code scout: `sonnet` for an eligible broad/unknown-owner zone; evidence map
  only, no findings or severity. If unavailable, use bounded local mapping and
  record the limitation; do not silently substitute a weaker model.
- Finder: `sonnet` for ordinary zones; `opus` for auth/RLS/payments/PII/
  migrations/queues/lifecycle.
- Skeptic: at least the finder's capability tier; `opus` for proposed Class A/B
  or security/privacy/payment findings.
- Debate follow-ups: use the lowest sufficient tier, but never below `opus` for
  Class A/B security or data-integrity disputes.

## Method

1. **Locate and verify the audit snapshot.** Find the active
   `docs/AUDIT-*/` folder named by `$1` or current context. If more than one
   in-progress audit is plausible, stop and request the exact `audit_id`; do
   not guess from directory sorting or date alone. Read `00_scope.md` and
   `manifest.md`. Verify the checkout is the recorded
   `target_sha`, or read that immutable tree through the declared clean
   worktree. Do not silently sweep current HEAD instead. If the target cannot
   be reproduced, stop with `BLOCKED_AUDIT_SNAPSHOT`.

2. **Pick the zone.** If `$1` names a zone, use it. If `$1` is empty or `next`,
   take the first `↻ re-sweep required` zone, otherwise the first `☐ pending`
   zone in the manifest. Load its owner, path/seam boundary, coupled zones, risk
   tags, validators, previous audit coverage, target SHA, exclusions, and
   overlap/re-sweep note. Only when neither status remains may you tell the user
   the sweep is complete and to run `tms-audit-triage`; stop.

3. **Ground with tools first.** Run the safe scoped validators recorded for the
   zone: dead-code/unused, dependency/cycle, typecheck, linter, focused tests,
   coverage or contract/generated-drift checks where available. Their output is
   grounded seed evidence, not an automatic finding. Do NOT install tools. Note
   every required validator that is unavailable, skipped, timed out, flaky, or
   cannot run at the target SHA. A green validator is coverage evidence only
   when the artifact records its exact command, discovered/tested count,
   relevant assertion or invariant, and a failing counterexample/negative path
   showing it can detect the candidate defect; otherwise it is merely a
   validator result or limitation.

4. **Define the ownership map required before judging.** Establish this compact
   shape through verified local evidence or the eligible scout:

   `business fact/capability → canonical owner/store → producers → consumers →
   competing sources/caches → invariant tests → release/runtime evidence`.

   Follow only the direct seams declared in the manifest; add a newly
   discovered coupled zone to the findings file and manifest notes rather than
   recursively reading the whole repository in one context.

5. **Run one bounded code scout only when eligible.** Use it when the zone is
   broad, its canonical owner/entrypoints/tests are not already explicit, or a
   new coupled seam makes the local map uncertain. Skip it for a narrow zone or
   when a verified map already exists for the same zone, target SHA, and
   worktree fingerprint.

   Resolve `scripts/repository_fingerprint.py` relative to this `SKILL.md` and
   run it against the exact audit worktree before spawning. Start exactly one
   fresh `sonnet` scout with no parent conversation, explicit read-only
   instructions, no implementation, no findings/severity, and no nested
   delegation. Give it the zone boundary, declared direct seams, target SHA,
   primary mapping goal, relevant instruction filenames, and the fingerprint
   command — not parent hypotheses or expected owners.

   Require one JSON object with no prose:

   ```json
   {
     "schema_version": "audit-code-map.v1",
     "status": "ready",
     "repository_state": {"head": "<sha>", "worktree_sha256": "<sha256>"},
     "zone": "<manifest-zone>",
     "targets": [
       {"path": "<relative>", "lines": [1, 2], "symbols": ["<symbol>"],
        "kind": "owner", "role": "<role>", "reason": "<evidence>"}
     ],
     "flow": [{"from": "<path:symbol>", "to": "<path:symbol>",
               "relation": "<verb>"}],
     "open_questions": []
   }
   ```

   `status` is `ready`, `not_found`, or `needs_clarification`; target `kind` is
   `owner`, `coupled`, `test`, or `constraint`. Allow at most 16 tight
   repository-relative targets, eight flow edges, and five questions. Reject
   unsafe/nonexistent/generated paths, absent symbols, vague reasons, extra
   fields, or a `ready` map without an owner and an existing closest test. A
   symbol must appear in or directly beside its range: use a declared symbol,
   an exact test title, or an exact route/RPC/SQL identifier literal — never an
   invented composite label. Keep each inclusive range to at most 80 lines and
   make its reason provable from that range. Flow endpoints use
   `path:symbol`; relation is one concise lowercase verb such as `calls`,
   `loads`, `persists`, `renders`, or `tests`, not a narrative.

   Parse and validate the map, rerun the fingerprint in the primary process,
   and accept it only when pre-scout, scout-reported, and post-scout `head` and
   `worktree_sha256` all match the audit target. Reopen every cited range and
   verify its symbol and role before giving the map to the finder. Send the same
   scout at most one focused correction for a malformed/stale map; after a
   second failure, use the narrowest local mapping and record the limitation,
   except when the result demonstrates that the map cannot fit within 16
   targets. That means the zone is oversized: set `↻ re-sweep required`, record
   the split reason, return it to Scope, and stop before Finder rather than
   spawning more scouts or squeezing out a coupled path.

6. **Finder pass.** Give the finder only the verified scout/local map plus tool
   seeds. Spawn a finder scoped to the zone and direct seams.
   Make its prompt self-contained with a compact extract of only the relevant
   project invariants: canonical owner/source of truth, required vertical
   trace, coupled paths, validation rules, and the known-test-debt register
   (`AGENTS.md` → *Testing And Validation*). Do not paste the
   whole project instruction file.
   Require it to hunt every in-scope debt category, including:

   - unreachable, unfinished, dead, or stranded product paths;
   - correctness/security/privacy/money/lifecycle/operational defects;
   - competing sources of truth, duplicated business decisions, dependency
     cycles, wrong ownership, or producer/consumer drift;
   - brittle or unbounded work and unsafe change coupling;
   - false-green tests or mocks that bypass the owning boundary;
   - source/generated/schema/migration/release/UI/document control-plane drift.

   Raw findings need `file:line`, kind/category, owner and affected seam,
   delta provenance, proposed severity with "why not lower", concrete impact,
   and evidence. Every A/B claim requires a runnable repro/test or concrete
   exploit/failure path. A technical/architecture-debt claim
   requires a demonstrated duplicate owner, cycle, dead path, false-green
   boundary, repeated reconciliation burden, or drift — not a preferred
   refactor. For an oversized zone, split across 2–3 finders by sub-area.
   Collect raw findings; do not yet trust them.

   `duplicate_closed` provenance is valid only when the cited closing commit is
   an ancestor of the audit target and the owning behavior still matches. A
   closed document without integrated code is not a refutation.

   A false-green-test finding stands only when a discriminating negative path
   fails to catch the defect, or concrete mock/assertion evidence shows that the
   test never crosses the owning boundary. Coverage percentage alone is not
   proof. Do not mutate task source merely to manufacture evidence.

7. **Skeptic pass — context asymmetry.** Spawn an INDEPENDENT skeptic subagent
   (fresh context) given ONLY each bare claim, `file:line`, owner/seam
   coordinates, target SHA, and the minimum zone/direct-seam code needed to
   refute it — NOT the finder's narrative. Give it the same compact project
   invariants required to judge the boundary; independence means withholding
   finder reasoning, not essential facts. Its job is to ask: reachable or
   merely imaginable; already owned/validated upstream; intentional and
   documented; duplicate of an open/closed item; dead-but-harmless; preference
   disguised as debt; or a local symptom of another owner? For A/B it
   independently checks the empirical evidence. Return `stands`, `refuted`, or
   `needs-revision`, confidence 0–100, and whether a refutation depends on an
   assumption or another zone that triage must revisit.

8. **Debate loop (default max 2 rounds).** For `needs-revision` / disputed
   findings, re-spawn the finder with the skeptic's objections to defend or
   revise, then re-spawn the skeptic to re-check. Iterate until no disputed
   findings remain or the round budget is hit. Stop early if rounds stop
   changing verdicts. A survivor below the configured confidence threshold is
   marked `unconfirmed`, dropped with a reason, or sent to a targeted re-sweep.
   Severity expresses potential harm and must never be lowered solely because
   confidence is low.

9. **Write `areas/<zone>.md`:**
   - audit target SHA, exact paths/seams, owner map, validators/results,
     scout eligibility/status/fingerprint, exclusions, unavailable manual/live
     signals, and overlap/re-sweep status;
   - **Confirmed findings** in the format declared by `00_scope.md`, including
     kind, owner/root cause, affected seam, delta provenance, confidence, and
     empirical evidence where required;
   - **False-positive ledger (required)** — what the skeptic killed and why,
     plus patterns considered but deliberately not flagged. Mark rejections
     that depend on another zone/assumption as `cross_zone_dependent` so triage
     can revisit them. An empty ledger is valid when the inspected surfaces and
     seams are recorded and every candidate still has an explicit disposition.

10. **Update `manifest.md`:** flip the zone to `☑ done`, or to
   `↻ re-sweep required` when an active overlap invalidates closure. Link its
   findings file and record audited SHA, validator status, counts, newly
   discovered coupled zones, and the overlap reason. One coordinator should
   serialize manifest edits when independent zones run in parallel. A row may
   become `☑ done` only when the area artifact exists, applicable checks or
   recorded limitations are present, every candidate has a disposition, and
   artifact/manifest counts match. A high-risk zone with
   `adversarial_review: LIMITED` remains `↻ re-sweep required` unless the user
   explicitly accepts that named limitation. A zero-finding zone is valid.

## Closing

Report (project's output language): zone and audited SHA, validators, X
confirmed / Y rejected with kind/Class breakdown, newly exposed seams,
manual/live unknowns, re-sweep status, and remaining zones. Tell the user to run
`tms-audit-sweep` again for the next zone in a fresh window, or
`tms-audit-triage` once all zones are done. One zone per window — do not chain
into the next zone here.
