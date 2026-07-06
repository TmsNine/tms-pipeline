---
name: tms-audit-sweep
description: "Codebase-audit stage 2 — sweep ONE zone for findings using an adversarial finder↔skeptic duel (independent subagents), record only the findings that survive refutation. Run once per zone, each in a fresh context window; no arg = next pending zone from the manifest. Second of the tms-audit-* pipeline. Use when the user invokes /tms-audit-sweep."
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

Audit exactly one zone and write its findings. The whole point of this stage is the **finder↔skeptic duel**: an automated audit's worst failure mode is false positives (problems that aren't real, or are already handled elsewhere). An independent skeptic that tries to refute every finding kills those before they reach the report.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for: severity rubric (Class A/B/C/D), tenant-scoping/auth/PII rules (so the skeptic knows what "already handled" looks like), validation commands, output language.

## Subagent independence (Claude Code)

A subagent spawned via the `Agent` tool runs in its own fresh context — it inherits NONE of this conversation. Use that: the skeptic must NOT see the finder's reasoning as your endorsement, only as claims to refute. Spawn both with `subagent_type: general-purpose`, `model: opus`.

## Method

1. **Locate the audit.** Find the active `docs/AUDIT-*/` folder (latest, or the one named in context). Read `00_scope.md` (categories, finding format, severity rubric) and `manifest.md`.

2. **Pick the zone.** If `$1` names a zone, use it. If `$1` is empty or `next`, take the first `☐ pending` zone in the manifest. If none are pending → tell the user the sweep is complete and to run `tms-audit-triage`; stop.

3. **Ground with tools first.** Run the static-analysis tools `00_scope.md` recorded, scoped to this zone (dead-code/unused, dep/cycle, `tsc --noEmit`, linter). Their output is **grounded seed evidence** — pass it to the finder so "dead code / unused export / cycle" findings are tool-verified facts, not LLM guesses. Do NOT install tools; if none exist for this zone, note that and proceed.

4. **Finder pass.** Spawn a finder subagent scoped to the zone's path(s), with the tool seeds. Self-contained prompt: hunt the in-scope categories, return raw findings each with `file:line`, category, proposed severity + a "why this class, not the one below" line, and concrete evidence. **Empirical gate:** any finding the finder wants to mark Class A/B in the correctness/security category must come with a runnable repro/test or a concrete exploit path — an argument alone is not enough; without it, it cannot be A/B. For an oversized zone, split across 2–3 finders by sub-area. Collect raw findings — do not yet trust them.

5. **Skeptic pass — context asymmetry.** Spawn an INDEPENDENT skeptic subagent (fresh context) given ONLY the bare claim + `file:line` + the zone code — **NOT the finder's narrative/reasoning** (so it forms an orthogonal judgement instead of anchoring on the finder). Its job is to **refute each one**, defaulting to skepticism: actually reachable? already validated/handled upstream? intentional? false positive? dead-but-harmless vs truly dead? For A/B correctness/security it must independently check the empirical evidence reproduces. Returns per finding a verdict — `stands` / `refuted` / `needs-revision` — with its own reasoning, and a **confidence 0–100** that the finding is real.

6. **Debate loop (default max 2 rounds).** For `needs-revision` / disputed findings, re-spawn the finder with the skeptic's objections to defend or revise, then re-spawn the skeptic to re-check. Iterate until no disputed findings remain or the round budget is hit. Stop early if rounds stop changing verdicts. **Confidence gate:** a survivor with final confidence below the threshold (default 70) is either dropped or downgraded a class, not recorded as a confident finding.

7. **Write `areas/<zone>.md`:**
   - **Confirmed findings** — for each: id `<zone>-NN`, category, **Class A/B/C/D** + the "why not the lower class" rationale (no inflation — use the project rubric), `file:line`, what's wrong, why it matters, suggested action, **confidence 0–100**, and for A/B correctness/security the **empirical evidence** (repro/test/exploit path).
   - **False-positive ledger (required, not optional)** — what the skeptic killed and the one-line reason, AND patterns the finder considered but deliberately did not flag. This section must be non-empty: if it's empty, the sweep didn't look hard enough. Keeps the audit auditable and stops the same non-issue resurfacing in triage or the next run.

8. **Update `manifest.md`:** flip the zone to `☑ done`, link its findings file, note counts (e.g. `7 confirmed / 4 rejected`).

## Closing

Report (project's output language): zone done, X confirmed / Y rejected with the Class breakdown, and how many zones remain `☐ pending`. Tell the user to run `tms-audit-sweep` again for the next zone (fresh window), or `tms-audit-triage` once all zones are done. One zone per window — the manifest is the only cross-window memory; do not chain into the next zone here.
