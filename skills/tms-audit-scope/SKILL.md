---
name: tms-audit-scope
description: "Codebase-audit stage 1 — inventory the repo, cut it into audit zones sized for one clean context window each, and write the audit folder + manifest. First of the tms-audit-* pipeline (scope → sweep → triage → backlog). Use when the user invokes /tms-audit-scope or wants to start a full-codebase audit of everything that needs finishing/fixing."
argument-hint: "[scope-slug]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Codebase Audit — Stage 1: Scope

Open a fresh, codebase-wide audit. This stage does NOT find problems — it builds the map and the work-list so later stages can sweep the code zone by zone, each in its own clean context window.

Read THIS project's `AGENTS.md` / `CLAUDE.md` first for: the `docs/` root and task-folder convention, the severity rubric (Class A/B/C/D) and what counts as a real blocker, the backlog location and bundle-don't-shard rules, and the output language for user-facing text (write the audit docs in that language).

This is the first of four skills:

```
tms-audit-scope  → 00_scope.md + manifest.md   (this skill)
tms-audit-sweep  → areas/<zone>.md             (run once per zone, fresh window)
tms-audit-triage → 01_triage.md                (dedup + classify + proposed bundles, then STOP for review)
tms-audit-backlog→ 02_backlog.md + backlog rows (after approval)
```

## Method

1. **Open / resume the audit folder.** Name it `AUDIT-<YYYY-MM-DD>` (today's date) under the project's `docs/` root, e.g. `docs/AUDIT-2026-06-06/`. If `[scope-slug]` is given, append it (`docs/AUDIT-2026-06-06-payments/`). If the folder already exists with a manifest, this is a resume — read it and only fill gaps; do NOT overwrite findings already gathered.

2. **Inventory, don't read deeply.** Map the repo shape, not its contents: `tree -L 2`/`-L 3`, `rg --files`, package layout, app/module boundaries, migration dir, test dirs. Spend the budget on the map; leave content-reading to the sweep stage.

   Also **detect the repo's own static-analysis tools** — the ones that turn "dead/unused code" findings from LLM guesswork into verified facts: dead-code/unused-export (`knip`, `ts-prune`, `eslint --rule no-unused`), dependency/cycle (`depcheck`, `madge --circular`), typecheck (`tsc --noEmit`), the project's linter, and any test-coverage command. Check `package.json` scripts and installed binaries — do NOT install anything. Record which tools exist (and the exact command to run each) in `00_scope.md`; the sweep stage runs them per zone as grounded seeds for the finder.

3. **Cut into zones.** A zone = a coherent surface small enough to audit thoroughly in ONE clean context window. Heuristics:
   - one module/folder per zone by default (e.g. each `apps/api/src/modules/<x>/`, `apps/miniapp/src/components`, `apps/miniapp/src/pages`, the migrations dir, shared libs/`lib/`);
   - split an oversized zone by sub-area until each is window-sized; merge tiny adjacent ones;
   - put cross-cutting concerns (auth/RLS/tenant-scoping libs) in their own zone — they deserve a focused sweep.
   Aim for zones a single sweep can cover without truncation, not the fewest possible.

4. **Confirm the audit categories** (default = all four, or the subset the user chose): недоделки/мёртвый код; корректность/безопасность; техдолг/консистентность; тесты/документация. Record which are in scope.

5. **Write `00_scope.md`:** audit goal; categories in scope; pointer to the project's severity rubric (Class A/B/C/D) and to the finding format below; the zone list with a one-line rationale per zone; suggested sweep order (cross-cutting/auth zones early so later zones can reference them).

6. **Write `manifest.md`:** a table the later stages read/update across windows —

   | # | Zone | Path(s) | Status | Findings file | Notes |
   |---|------|---------|--------|---------------|-------|
   | 1 | … | … | ☐ pending | `areas/<zone>.md` | |

   Status values: `☐ pending`, `☑ done`. The sweep stage flips these.

7. **Finding format (declare it in `00_scope.md` so every sweep is consistent):** each finding has — id `<zone>-NN`; category; severity Class A/B/C/D **plus a one-line "why this class, not the one below" rationale** (anti-inflation); location `file:line`; what's wrong; why it matters; suggested action; **confidence 0–100** (sweep records this and gates on a threshold — default 70; below it the finding is dropped or downgraded); for Class A/B correctness/security findings, an **empirical evidence** pointer (runnable repro/test or concrete exploit path). The sweep also keeps a visible **false-positive ledger** (claims considered and deliberately not flagged, with reason).

## Closing

Report to the user (in the project's output language): how many zones, the suggested order, and that the next step is to run `tms-audit-sweep` once per zone in a fresh window (no arg = next pending zone). Stop — do not start sweeping in this window.
