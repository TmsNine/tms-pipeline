---
name: tms-audit-scope
description: "Codebase-audit stage 1 — establish an immutable full-or-delta audit snapshot, inventory code and control-plane surfaces, cut technical and architectural debt into context-sized owner/seam zones, and write the audit folder + manifest. First of the tms-audit-* pipeline (scope → sweep → triage → backlog). Use when the user invokes /tms-audit-scope or wants to start or resume a codebase audit of unfinished work, defects, architecture debt, technical debt, false-green tests, or release/document drift."
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Codebase Audit — Stage 1: Scope

Open a fresh full or delta audit. This stage does NOT decide findings — it
establishes the exact auditable snapshot, coverage model, and work-list so later
stages can search for technical and architectural debt zone by zone.

Read THIS project's `AGENTS.md` / `CLAUDE.md` first for: the `docs/` root and
task-folder convention, any project-owned severity rubric and what counts as a
real blocker, the backlog location and bundle-don't-shard rules, validation
rules such as the known-test-debt register (`AGENTS.md` → *Testing And
Validation*), and the output language for user-facing text (write the audit docs in that language).

This is the first of four skills:

```
tms-audit-scope  → 00_scope.md + manifest.md   (this skill)
tms-audit-sweep  → areas/<zone>.md             (run once per zone, fresh window)
tms-audit-triage → 01_triage.md                (dedup + classify + proposed bundles, then STOP for review)
tms-audit-backlog→ 02_backlog.md + backlog rows (after approval)
```

## Method

1. **Open / resume the audit folder.** Name it `AUDIT-<YYYY-MM-DD>` (today's date) under the project's `docs/` root, e.g. `docs/AUDIT-<YYYY-MM-DD>/`. If `[scope-slug]` is given, append it (`docs/AUDIT-<YYYY-MM-DD>-<scope-slug>/`). If the folder already exists with a manifest, this is a resume — read it and only fill gaps; do NOT overwrite findings already gathered.

2. **Establish the audit envelope before mapping zones.** Record it in
   `00_scope.md`:

   - mode: `full` or `delta`;
   - canonical checkout/worktree, target ref, and immutable `target_sha`;
   - for delta mode, `from_sha`, ancestry proof, and why that lower bound is
     trusted;
   - the clean checkout/worktree used to read `target_sha`;
   - dirty paths, unrelated exclusions, active worktrees, and path overlaps
     that require a post-integration re-sweep;
   - migration/schema tail with exact number/path/content hash, plus collisions;
   - prior audits plus, per relevant zone, the last audited SHA and categories
     actually covered;
   - current backlog/release/status sources named by project instructions.

   Never audit an ambiguous mixed working tree as canonical state. A dirty
   primary checkout is acceptable only when the audit reads an exact clean
   worktree or immutable tree and records the exclusion. If the target SHA,
   ancestry, or task ownership cannot be resolved, set
   `can_start_sweeps: no` in a minimal blocked `00_scope.md`, report
   `BLOCKED_AUDIT_SNAPSHOT`, and stop without creating a misleading manifest.
   Resolve "canonical" from the project's integration rules; if local and
   remote refs conflict and no owner is declared, block instead of choosing the
   convenient ref. For a legacy audit without a pinned SHA, use a conservative
   lower bound only when ancestry plus repository evidence proves it; otherwise
   switch to full mode rather than guessing.

3. **Inventory, don't read deeply.** Map the repo shape, not its contents:
   `tree -L 2`/`-L 3`, `rg --files`, package layout, app/module boundaries,
   public entrypoints, migration/schema dirs, test dirs, generated contracts,
   CI/deploy/env schemas, and project-named UI baseline, backlog, launch, and
   architecture sources. Spend the budget on the map; leave content-reading to
   the sweep stage.

   Also **detect the repo's own static-analysis tools** — the ones that turn "dead/unused code" findings from LLM guesswork into verified facts: dead-code/unused-export (`knip`, `ts-prune`, `eslint --rule no-unused`), dependency/cycle (`depcheck`, `madge --circular`), typecheck (`tsc --noEmit`), the project's linter, and any test-coverage command. Check `package.json` scripts and installed binaries — do NOT install anything. Record which tools exist (and the exact command to run each) in `00_scope.md`; the sweep stage runs them per zone as grounded seeds for the finder.
   Mark commands that generate or mutate artifacts; run those only in the
   isolated audit worktree and never treat their output as audited source
   unless a generated-drift check explicitly requires it.

4. **Build the coverage set.**

   - Full mode covers the whole current repository and every relevant
     project-named control-plane surface.
   - Delta mode covers changed paths plus their owning layer, direct producers,
     consumers, schemas, migrations, tests, generated artifacts, and release
     evidence. A diff-only file list is not an architecture audit.
   - If that expanded delta reaches most owner/seam zones, keep the truthful
     `from_sha → target_sha` provenance but use full-sweep coverage. Do not
     present a repo-wide delta as a narrow audit.
   - A prior SHA is not proof that every category was audited. Any zone without
     a trustworthy category-specific baseline receives a full sweep.
   - Always include the relevant cold completeness lenses even when their files
     did not change: canonical fact/source ownership; auth/RLS/tenant/PII/money;
     lifecycle/queues/external effects; semantic duplication/dependency cycles;
     UI routes/navigation/visible states/accessibility; worker/scheduler/admin
     control-plane; false-green tests; and CI/infra/env/launch/generated/
     migration/document parity.
   - Record production-only data distribution, provider, load, environment, or
     human UAT signals that code inspection cannot prove. They are explicit
     manual/live unknowns, not silently covered facts.

5. **Cut into owner/seam zones.** A zone = a coherent surface small enough to audit thoroughly in ONE clean context window. Heuristics:
   - one module/folder per zone by default (e.g. each backend module `src/modules/<x>/`, a frontend `components/` or `pages/` folder, the database migrations folder, shared libs/`lib/`);
   - split an oversized zone by sub-area until each is window-sized; merge tiny adjacent ones;
   - put cross-cutting concerns (auth/RLS/tenant-scoping libs) in their own zone — they deserve a focused sweep;
   - create explicit seam zones when one business fact has multiple producers,
     consumers, stores, caches, or UI representations. Folder-only zoning
     cannot prove architectural ownership.
   Aim for zones a single sweep can cover without truncation, not the fewest possible.

6. **Confirm the debt categories** (default = all, or the subset the user
   chose):

   - unfinished/dead/unused code and stranded feature paths;
   - correctness, security, privacy, money, lifecycle, and operational defects;
   - architecture debt: competing owners/sources of truth, broken producer ↔
     consumer seams, semantic duplication, cycles, and unsafe coupling;
   - technical debt: change hazards, inconsistent patterns, unbounded work,
     brittle/generated drift, and missing maintainability safeguards;
   - test/proof debt: false-green mocks, missing negative paths, stale
     baselines, and coverage that does not cross the owning boundary;
   - documentation/release/control-plane drift.

   Copy the project's Class A/B/C/D rubric verbatim into `00_scope.md`. If the
   project does not contain one, declare this audit-local rubric there: A =
   data loss, security/PII breach, irreversible money error, or launch blocker;
   B = reachable user/data/operational incident; C = evidenced architecture/
   maintainability debt with concrete change cost or failure risk; D =
   low-impact or theoretical concern. That exact copy is canonical for every
   later sweep and triage; do not invent severity per zone.

7. **Write `00_scope.md`:** stable `audit_id`; audit envelope; goal;
   categories and cold lenses;
   the exact canonical severity rubric; prior-audit/dedup baseline; explicit
   exclusions and manual/live unknowns; tool/validator commands; a complete
   path/seam → canonical owner map; zone list with a one-line rationale;
   suggested sweep order; and `can_start_sweeps: yes|no`. Put shared owners and
   high-risk seams early so later zones can reference them.

8. **Write `manifest.md`:** a table the later stages read/update across windows —

   | # | Zone | Path(s)/seams | Owner | Risk tags + validators | Prior SHA + categories | From → target SHA | Audited SHA | Status | Findings file | Notes |
   |---|------|---------------|-------|------------------------|------------------------|-------------------|-------------|--------|---------------|-------|
   | 1 | … | … | … | … | … | … → … | — | ☐ pending | `areas/<zone>.md` | coupled zones / overlap |

   Status values: `☐ pending`, `☑ done`, and `↻ re-sweep required`. The sweep
   stage flips these; the last status blocks complete triage until re-swept.

9. **Finding gate and format.** Declare in `00_scope.md` that every finding has:
   id `<zone>-NN`; kind (`code_defect`, `architecture_debt`,
   `technical_debt`, `test_proof_debt`, `control_plane_drift`, or
   `manual_live_gap`); category; owner/root cause and affected seam; audited
   SHA; delta provenance (`new`, `regressed`, `pre_existing`, or
   `duplicate_closed`); severity Class A/B/C/D plus a one-line "why this class,
   not the one below" rationale; `file:line`; what's wrong; concrete user/data/
   operational or change-safety impact; suggested owning-layer action; and
   confidence 0–100. Severity expresses potential harm if the claim is true;
   confidence expresses evidence strength. Never lower severity solely because
   confidence is low.

   Every Class A/B finding requires a runnable reproduction/test or concrete
   exploit/failure path. Architecture/technical-debt findings require concrete
   repository evidence such as competing business-rule owners, a dependency
   cycle, verified dead code, a false-green boundary, repeated manual
   reconciliation, or source/generated/release drift. A preference for a
   different abstraction is not debt. Default confidence threshold is 70;
   below it, mark the candidate `unconfirmed`, drop it with a reason, or require
   a targeted re-sweep. Do not convert uncertainty into a lower severity.
   Every sweep also keeps a visible false-positive ledger.

## Closing

Report to the user (in the project's output language): full/delta mode,
`from_sha`/`target_sha`, snapshot readiness, exclusions/overlaps, categories and
cold lenses, zone count, suggested order, and
`can_start_sweeps: yes|no`. If yes, the next step is `tms-audit-sweep` once per
zone in a fresh window. Stop — do not start sweeping in this window.
